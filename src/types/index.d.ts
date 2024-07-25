import {ZodIssue} from "zod";
import {Prisma} from ".prisma/client";

// This is made for the types that are used in the whole project, for example to throw errors or to return a result
// This is a discriminated union, we can return a success with data of certain type,
// or an error with a string or an array of ZodIssues
type ActionResult<T> = {status: 'success', data: T}
    | {status: 'error', error: string | ZodIssue[]};

type MessageWithSenderRecipient = Prisma.MessageGetPayload<{
    select: {
        id: true,
        text: true,
        created: true,
        dateRead: true,
        sender: {
            select: {
                userId, name, image
            }
        },
        recipient: {
            select: {
                userId, name, image
            }
        }
    }
}>

type MessageDto = {
    id: string,
    text: string,
    created: string,
    dateRead?: string | null,
    senderId?: string,
    senderName?: string,
    senderImage?: string | null,
    recipientId?: string,
    recipientName?: string,
    recipientImage?: string | null,
}

type UserFilters = {
    ageRange: Number[];
    orderBy: string;
    gender: string[];
}