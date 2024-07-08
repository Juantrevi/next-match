'use server'

import {messageSchema, MessageSchema} from "@/lib/messageSchema";
import {ActionResult} from "@/types";
import {Message} from "@prisma/client";
import {getAuthUserId} from "@/app/actions/authActions";
import {prisma} from "@/lib/prisma";
import {mapMessageToMessageDto} from "@/lib/mappings";

export async function createMessage(recipientUserId: string, data: MessageSchema): Promise<ActionResult<Message>>{
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
            }
        });

        return {status: 'success', data: message};

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
                        recipientId
                    },
                    {
                        senderId: recipientId,
                        recipientId: userId
                    }
                ]
            },
            orderBy: {
                created: 'asc'
            },
            select: {
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
        });

        if(messages.length > 0) {
            await prisma.message.updateMany({
                where: {
                    senderId: recipientId,
                    recipientId: userId,
                    dateRead: null
                },
                data: {
                    dateRead: new Date()
                }
            })
        }

        return messages.map(message => mapMessageToMessageDto(message))


    }catch (error){
        console.log(error);
        throw error;
    }

}

export async function getMessagesByContainer(container: string){
    try {
        const userId = await getAuthUserId();

        const selector = container === 'outbox' ? 'senderId' : 'recipientId';

        const messages = await prisma.message.findMany({
            where: {
                [selector]: userId
            },
            orderBy: {
                created: 'desc'
            },
            select: {
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
        })

        return messages.map(message => mapMessageToMessageDto(message))


    }catch (error){
        console.log(error);
        throw error;
    }

}