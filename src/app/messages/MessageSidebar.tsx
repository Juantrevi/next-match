// This component renders a sidebar with options for "Inbox" and "Outbox".
// It fetches the unread message count from a store and displays it as a chip next to the "Inbox" option.
// The selected option is highlighted, and clicking on an option updates the URL with the selected container.

'use client';

import React, {useState} from 'react';
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {GoInbox} from "react-icons/go";
import {MdOutlineOutbox} from "react-icons/md";
import clsx from "clsx";
import {Chip} from "@nextui-org/chip";
import {router} from "next/client";
import useMessageStore from "@/hooks/useMessageStore";

export default function MessageSidebar() {
    const {unreadCount} = useMessageStore(state => ({
        unreadCount: state.unreadCount // Get the unread message count from the store
    }));
    const searchParams = useSearchParams(); // Get the current search parameters
    const [selected, setSelected] = useState<string>(searchParams.get('container') || 'inbox'); // Set the initial selected container
    const router = useRouter(); // Get the router instance
    const pathName = usePathname(); // Get the current pathname

    const items = [
        {key: 'inbox', label: 'Inbox', icon: GoInbox, chip: true}, // Define the inbox item
        {key: 'outbox', label: 'Outbox', icon: MdOutlineOutbox, chip: false}, // Define the outbox item
    ]

    const handleSelect = (key: string) => {
        setSelected(key); // Update the selected container
        const params = new URLSearchParams();
        params.set('container', key); // Set the container parameter
        router.replace(`${pathName}?${params}`) // Replace the URL with the new container parameter
    };

    return (
        <div className={'flex flex-col shadow-md rounded-lg cursor-pointer'}>
            {items.map(({key, label, icon: Icon, chip}) => (
                <div
                    key={key} // Set the key for the item
                    className={clsx('flex flex-row items-center rounded-t-lg gap-2 p-3', {
                        'text-secondary font-semibold': selected === key, // Highlight the selected item
                        'text-black hover:text-secondary/70': selected !== key // Style the non-selected items
                    })}
                    onClick={() => handleSelect(key)} // Handle item selection
                >
                    <Icon size={24} /> {/* Render the item icon */}
                    <div className={'flex justify-between flex-grow'}>
                        <span>{label}</span> {/* Render the item label */}
                        {chip && <Chip>{unreadCount}</Chip>} {/* Render the unread count chip if applicable */}
                    </div>
                </div>
            ))}
        </div>
    );
};