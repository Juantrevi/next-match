// This component renders the Messages page.
// It includes a sidebar for selecting message containers and a table for displaying messages.
// It fetches messages based on the selected container and passes them to the MessageTable component.

import React from 'react';
import MessageSidebar from "@/app/messages/MessageSidebar";
import {getMessagesByContainer, getMessageThread} from "@/app/actions/messageActions";
import MessageTable from "@/app/messages/MessageTable";

export default async function MessagesPage({searchParams}:{searchParams: {container: string}}) {

    const {messages, nextCursor} = await getMessagesByContainer(searchParams.container); // Fetch messages based on the selected container

    return (
        <div className={'grid grid-cols-12 gap-5 height-[80vh] mt-10'}>
            <div className={'col-span-2'}>
                <MessageSidebar /> {/* Render the sidebar for selecting message containers */}
            </div>
            <div className={'col-span-10'}>
                <MessageTable initialMessages={messages} nextCursor = {nextCursor} /> {/* Render the table with fetched messages */}
            </div>
        </div>
    );
};