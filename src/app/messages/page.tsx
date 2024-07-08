import React from 'react';
import MessageSidebar from "@/app/messages/MessageSidebar";
import {getMessagesByContainer, getMessageThread} from "@/app/actions/messageActions";

export default async function MessagesPage({searchParams}:{searchParams: {container: string}}) {

    const messages = await getMessagesByContainer(searchParams.container);

    return (
        <div className={'grid grid-cols-12 gap-5 height-[80vh] mt-10'}>
            <div className={'col-span-2'}>
                <MessageSidebar />
            </div>
            <div className={'col-span-10'}>
                Message table goes here
            </div>
        </div>
    );
};