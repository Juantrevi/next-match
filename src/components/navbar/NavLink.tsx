'use client';

import React from 'react';
import {NavbarItem} from "@nextui-org/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useMessageStore from "@/hooks/useMessageStore";

type Props = {
    href: string;
    label: string;
}

// Destructuring props
export default function NavLink({href, label}: Props) {
    //React hook is a function that allows you to use state and other React features in a functional component
    const pathname = usePathname();
    const {unreadCount} = useMessageStore(state => ({
        unreadCount: state.unreadCount
    }));


    return (
        <NavbarItem isActive={pathname === href} as={Link} href={href}>
            <span>{label}</span>
            {href === '/messages' && unreadCount > 0 && (
                <span className={'ml-1'}> ({unreadCount}) </span>
            )}
        </NavbarItem>
    );
};