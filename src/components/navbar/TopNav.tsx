import React from 'react';
import {Button, Navbar, NavbarBrand, NavbarContent} from "@nextui-org/react";
import {GiMatchTip} from "react-icons/gi";
import Link from "next/link";
import NavLink from "./NavLink";
import {auth} from "@/auth";
import UserMenu from "@/components/navbar/UserMenu";
import {getUserInfoForNav} from "../../app/actions/userAction";
import FiltersWrapper from "@/components/navbar/FiltersWrapper";

export default async function TopNav() {
    const session = await auth();
    const userInfo = session?.user && await getUserInfoForNav();

    const memberLinks = [
        { href: '/members', label: 'Matches' },
        { href: '/lists', label: 'Lists' },
        { href: '/messages', label: 'Messages' }
    ]

    const adminLinks = [
        { href: '/admin/moderation', label: 'Photo Moderation' }
    ]

    const links = session?.user.role === 'ADMIN' ? adminLinks : memberLinks;

    return (
        <>
        <Navbar
            maxWidth='xl'
            className='bg-gradient-to-r from-purple-400 to-purple-700'
            classNames={{
                item: [
                    'text-xl',
                    'text-white',
                    'uppercase',
                    'data-[active=true]:text-yellow-200'
                ]
            }}
        >
            <NavbarBrand as={Link} href='/'>
                <GiMatchTip size={40} className='text-gray-200'/>
                <div className='font-bold text-3xl flex'>
                    <span className='text-gray-900'>Next</span>
                    <span className='text-gray-200'>Match</span>
                </div>
            </NavbarBrand>
            <NavbarContent justify='center'>
                {userInfo && (
                    <>
                        {links.map(item => (
                            <NavLink key={item.href} href={item.href} label={item.label} />
                        ))}
                        </>
                )}
            </NavbarContent>
            <NavbarContent justify='end'>
                {userInfo ? (
                    <UserMenu user={ userInfo } />
                ) :
                <>
                    <Button as={Link} href='/login' variant='bordered' className='text-white'>Login</Button>
                    <Button as={Link} href='/register' variant='bordered' className='text-white'>Register</Button>
                </>
                }
            </NavbarContent>
        </Navbar>
            <FiltersWrapper />
        </>
    );
};