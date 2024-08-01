'use server'

import {messageSchema, MessageSchema} from "@/lib/messageSchema";
import {ActionResult, MessageDto} from "@/types";
import {Message} from "@prisma/client";
import {getAuthUserId} from "@/app/actions/authActions";
import {prisma} from "@/lib/prisma";
import {mapMessageToMessageDto} from "@/lib/mappings";
import {pusherServer} from "@/lib/pusher";
import {createChatId} from "@/lib/util";

export async function createMessage(recipientUserId: string, data: MessageSchema): Promise<ActionResult<MessageDto>>{
    try {
        const userId = await getAuthUserId();

        const validated = messageSchema.safeParse(data);

        if (!validated.success) return {status: 'error', error: validated.error.errors};

        const {text} = validated.data;

        const message = await prisma.message.create({
            data: {
                text,
                senderId: userId,
                recipientId: recipientUserId
            },
            select: messageSelect
        });

        const messageDto = mapMessageToMessageDto(message);

        await pusherServer.trigger(createChatId(userId, recipientUserId), 'message:new', messageDto);
        await pusherServer.trigger(`private-${recipientUserId}`, 'message:new', messageDto);

        return {status: 'success', data: messageDto};

    }catch (error){
        console.log(error);
        return {status: 'error', error: 'An error occurred while creating message'};
    }
}

export async function getMessageThread(recipientId: string){

    try{
        const userId = await getAuthUserId();

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
        });

        let readCount = 0;

        if(messages.length > 0) {
            const readMessageIds = messages
                .filter(m => m.dateRead === null
                    && m.sender?.userId === recipientId
                    && m.recipient?.userId === userId)
                .map(m => m.id)

            await prisma.message.updateMany({
                where: {id: {in:readMessageIds}},
                data: {
                    dateRead: new Date()
                }
            })

            readCount = readMessageIds.length;

            await pusherServer.trigger(createChatId(recipientId, userId), 'messages:read', readMessageIds);
        }

        const messagesToReturn = messages.map(message => mapMessageToMessageDto(message))

        return {messages: messagesToReturn, readCount};


    }catch (error){
        console.log(error);
        throw error;
    }

}

// Function to get messages by container (inbox or outbox) with cursor-based pagination
export async function getMessagesByContainer(container?: string | null, cursor?: string, limit = 10) {
    try {
        // Get the ID of the currently authenticated user
        const userId = await getAuthUserId();

        // Define conditions based on the container type (inbox or outbox)
        const conditions = {
            [container === 'outbox' ? 'senderId' : 'recipientId']: userId, // Set senderId or recipientId based on container
            ...(container === 'outbox' ? { senderDeleted: false } : { recipientDeleted: false }) // Exclude deleted messages
        };

        // Fetch messages from the database with the specified conditions and cursor for pagination
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
        });

        let nextCursor: string | undefined;

        // Check if there are more messages than the limit
        if (messages.length > limit) {
            const nextItem = messages.pop(); // Remove the extra message
            nextCursor = nextItem?.created.toISOString(); // Set the next cursor to the creation date of the extra message
        } else {
            nextCursor = undefined; // No more messages, set next cursor to undefined
        }

        // Map messages to DTOs (Data Transfer Objects)
        const messagesToReturn = messages.map(message => mapMessageToMessageDto(message));

        // Return the messages and the next cursor
        return {
            messages: messagesToReturn,
            nextCursor
        };

    } catch (error) {
        console.log(error); // Log any errors
        throw error; // Rethrow the error to be handled by the caller
    }
}


export async function deleteMessage(messageId: string, isOutbox: boolean){
    const selector = isOutbox ? 'senderDeleted' : 'recipientDeleted';

    try {
        const userId = await getAuthUserId();

        await prisma.message.update({
            where: {
                id: messageId
            },
            data: {
                [selector]: true
            }
        })

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
        })

        if (messagesToDelete.length > 0){
            await prisma.message.deleteMany({
                where: {
                    OR: messagesToDelete.map(m => ({id: m.id}))
                }
            })
        }
    }catch (error){
        console.log(error);
        throw error;
    }
}

export async function getUnreadMessageCount(){
    try {
        const userId = await getAuthUserId();
        return prisma.message.count({
            where: {
                recipientId: userId,
                dateRead: null,
                recipientDeleted: false
            }
        })
    }catch (error){
        console.log(error);
        throw error;
    }
}

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
}

