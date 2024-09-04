// This component renders a table cell for a message.
// It handles different types of content based on the column key, such as displaying avatars for sender/recipient names, truncating text, and showing creation dates.
// It also provides a button to delete a message, with a confirmation modal.

import React from 'react';
import PresenceAvatar from "@/components/PresenceAvatar";
import {truncateString} from "@/lib/util";
import {Button, ButtonProps, useDisclosure} from "@nextui-org/react";
import {AiFillDelete} from "react-icons/ai";
import {MessageDto} from "@/types";
import AppModal from "@/components/AppModal";

type Props = {
    item: MessageDto, // Message item
    columnKey: string, // Key of the column to display
    isOutbox: boolean, // Flag indicating if the current view is the outbox
    deleteMessage: (message: MessageDto) => void, // Function to delete a message
    isDeleting: boolean // Flag indicating if the message is being deleted
}

export default function MessageTableCell({item, columnKey, isOutbox, deleteMessage, isDeleting}: Props) {

    const cellValue = item[columnKey as keyof MessageDto]; // Get the value for the current column
    const {isOpen, onOpen, onClose} = useDisclosure(); // Modal state management

    const onConfirmDeleteMessage = () => {
        deleteMessage(item); // Confirm deletion of the message
    }

    const footerButtons: ButtonProps[] = [
        {color: 'default', onClick: onClose, children: 'Cancel'}, // Cancel button for the modal
        {color: 'secondary', onClick: onConfirmDeleteMessage, children: 'Confirm'} // Confirm button for the modal
    ]

    switch (columnKey){
        case 'recipientName':
        case 'senderName':
            return(
                <div className='flex items-center gap-2 cursor-pointer' >
                    <PresenceAvatar
                        userId={isOutbox ? item.recipientId : item.senderId} // Display avatar based on outbox flag
                        src={isOutbox ? item.recipientImage : item.senderImage} // Display image based on outbox flag
                    />
                    <span>{cellValue}</span> {/* Display the name */}
                </div>
            )
        case 'text':
            return (
                <div>
                    {truncateString(cellValue)} {/* Truncate and display the text */}
                </div>
            )
        case 'created':
            return <div>{cellValue}</div>; // Display the creation date

        default:
            return(
                <>
                    <Button
                        isIconOnly
                        variant='light'
                        onClick={() => onOpen()} // Open the confirmation modal
                        isLoading={isDeleting} // Show loading state if deleting
                    >
                        <AiFillDelete size={24} className={'text-danger'} /> {/* Delete icon */}
                    </Button>
                    <AppModal
                        isOpen={isOpen} // Modal open state
                        onClose={onClose} // Close the modal
                        header={'Please confirm this action'} // Modal header
                        body={<div>Are you sure you want to delete this message? THIS CANNOT BE UNDONE</div>} // Modal body
                        footerButtons={footerButtons} // Modal footer buttons
                    />
                </>
            );
    }
};