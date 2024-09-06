// This module contains server-side actions for managing messages and their interactions.
// It includes functions to create messages, get message threads, get messages by container, delete messages, and get unread message count.
// These actions handle authentication, validation, and database interactions using Prisma and Pusher.

'use server'

import {messageSchema, MessageSchema} from "@/lib/messageSchema"; // Import message schema for validation
import {ActionResult, MessageDto} from "@/types"; // Import custom types for action results and message DTOs
import {Message} from "@prisma/client"; // Import Prisma Message model
import {getAuthUserId} from "@/app/actions/authActions"; // Function to get authenticated user ID
import {prisma} from "@/lib/prisma"; // Prisma client for database interactions
import {mapMessageToMessageDto} from "@/lib/mappings"; // Function to map message to message DTO
import {pusherServer} from "@/lib/pusher"; // Pusher server for real-time notifications
import {createChatId} from "@/lib/util"; // Utility function to create chat ID

// Function to create a new message
export async function createMessage(recipientUserId: string, data: MessageSchema): Promise<ActionResult<MessageDto>>{
    try {
        const userId = await getAuthUserId(); // Get authenticated user ID

        const validated = messageSchema.safeParse(data); // Validate input data

        if (!validated.success) return {status: 'error', error: validated.error.errors}; // Return error if validation fails

        const {text} = validated.data;

        const message = await prisma.message.create({
            data: {
                text,
                senderId: userId,
                recipientId: recipientUserId
            },
            select: messageSelect
        }); // Create new message in the database

        const messageDto = mapMessageToMessageDto(message); // Map message to message DTO

        await pusherServer.trigger(createChatId(userId, recipientUserId), 'message:new', messageDto); // Trigger Pusher event for new message
        await pusherServer.trigger(`private-${recipientUserId}`, 'message:new', messageDto); // Trigger Pusher event for new message

        return {status: 'success', data: messageDto}; // Return success with created message DTO

    }catch (error){
        console.log(error); // Log any errors
        return {status: 'error', error: 'An error occurred while creating message'}; // Handle errors
    }
}

// Function to get message thread between authenticated user and recipient
export async function getMessageThread(recipientId: string){
    try{
        const userId = await getAuthUserId(); // Get authenticated user ID

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        senderId: userId,
                        recipientId,
                        senderDeleted: false
                    },
                    {
                        senderId: recipientId,
                        recipientId: userId,
                        recipientDeleted: false
                    }
                ]
            },
            orderBy: {
                created: 'asc'
            },
            select: messageSelect
        }); // Fetch message thread

        let readCount = 0;

        if(messages.length > 0) {
            const readMessageIds = messages
                .filter(m => m.dateRead === null
                    && m.sender?.userId === recipientId
                    && m.recipient?.userId === userId)
                .map(m => m.id);

            await prisma.message.updateMany({
                where: {id: {in:readMessageIds}},
                data: {
                    dateRead: new Date()
                }
            }); // Update read status for messages

            readCount = readMessageIds.length;

            await pusherServer.trigger(createChatId(recipientId, userId), 'messages:read', readMessageIds); // Trigger Pusher event for read messages
        }

        const messagesToReturn = messages.map(message => mapMessageToMessageDto(message)); // Map messages to DTOs

        return {messages: messagesToReturn, readCount}; // Return messages and read count

    }catch (error){
        console.log(error); // Log any errors
        throw error; // Throw error
    }
}

// Function to get messages by container (inbox or outbox) with cursor-based pagination
export async function getMessagesByContainer(container?: string | null, cursor?: string, limit = 10) {
    try {
        const userId = await getAuthUserId(); // Get authenticated user ID

        const conditions = {
            [container === 'outbox' ? 'senderId' : 'recipientId']: userId, // Set senderId or recipientId based on container
            ...(container === 'outbox' ? { senderDeleted: false } : { recipientDeleted: false }) // Exclude deleted messages
        }; // Define conditions based on container type

        const messages = await prisma.message.findMany({
            where: {
                ...conditions, // Apply the conditions
                ...(cursor ? { created: { lte: new Date(cursor) } } : {}) // Apply cursor if provided
            },
            orderBy: {
                created: 'desc' // Order messages by creation date in descending order
            },
            select: messageSelect, // Select specific fields to return
            take: limit + 1 // Fetch one extra message to determine if there are more messages
        }); // Fetch messages from the database

        let nextCursor: string | undefined;

        if (messages.length > limit) {
            const nextItem = messages.pop(); // Remove the extra message
            nextCursor = nextItem?.created.toISOString(); // Set the next cursor to the creation date of the extra message
        } else {
            nextCursor = undefined; // No more messages, set next cursor to undefined
        }

        const messagesToReturn = messages.map(message => mapMessageToMessageDto(message)); // Map messages to DTOs

        return {
            messages: messagesToReturn,
            nextCursor
        }; // Return the messages and the next cursor

    } catch (error) {
        console.log(error); // Log any errors
        throw error; // Rethrow the error to be handled by the caller
    }
}

// Function to delete a message
export async function deleteMessage(messageId: string, isOutbox: boolean){
    const selector = isOutbox ? 'senderDeleted' : 'recipientDeleted'; // Determine selector based on outbox or inbox

    try {
        const userId = await getAuthUserId(); // Get authenticated user ID

        await prisma.message.update({
            where: {
                id: messageId
            },
            data: {
                [selector]: true
            }
        }); // Mark message as deleted

        const messagesToDelete = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        senderId: userId,
                        senderDeleted: true,
                        recipientDeleted: true
                    },
                    {
                        recipientId: userId,
                        senderDeleted: true,
                        recipientDeleted: true
                    }
                ]
            }
        }); // Find messages to delete

        if (messagesToDelete.length > 0){
            await prisma.message.deleteMany({
                where: {
                    OR: messagesToDelete.map(m => ({id: m.id}))
                }
            }); // Delete messages
        }
    }catch (error){
        console.log(error); // Log any errors
        throw error; // Throw error
    }
}

// Function to get unread message count for the authenticated user
export async function getUnreadMessageCount(){
    try {
        const userId = await getAuthUserId(); // Get authenticated user ID
        return prisma.message.count({
            where: {
                recipientId: userId,
                dateRead: null,
                recipientDeleted: false
            }
        }); // Return unread message count
    }catch (error){
        console.log(error); // Log any errors
        throw error; // Throw error
    }
}

// Select fields for message queries
const messageSelect = {
    id: true,
    text: true,
    created: true,
    dateRead: true,
    sender: {
        select: {
            userId: true,
            name: true,
            image: true
        }
    },
    recipient: {
        select: {
            userId: true,
            name: true,
            image: true
        }
    }
};