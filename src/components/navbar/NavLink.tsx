'use client';

import React from 'react';
import {NavbarItem} from "@nextui-org/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
    href: string;
    label: string;
}

// Destructuring props
export default function NavLink({href, label}: Props) {
    //React hook is a function that allows you to use state and other React features in a functional component
    const pathname = usePathname();

    return (
        <NavbarItem isActive={pathname === href} as={Link} href={href}>{label}</NavbarItem>
    );
};