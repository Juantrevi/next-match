'use server'

import {messageSchema, MessageSchema} from "@/lib/messageSchema";
import {ActionResult} from "@/types";
import {Message} from "@prisma/client";
import {getAuthUserId} from "@/app/actions/authActions";
import {prisma} from "@/lib/prisma";

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