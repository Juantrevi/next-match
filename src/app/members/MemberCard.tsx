import React from 'react';
import {Member} from ".prisma/client";
import {Card, CardFooter, Image} from "@nextui-org/react";

type Props = {
    member: Member
}

export default function MemberCard({member}: Props) {
    return (
        <Card fullWidth>
            <Image
            isZoomed
            alt={member.name}
            width={300}
            src={member.image || '/images/user.png'}
            className='aspect-square object-cover'/>
            <CardFooter>
                <div className='flex flex-col text-white'>
                    <span className='font-semibold'>{member.name}</span>
                    <span className='text-sm'>{member.city}</span>
                </div>
            </CardFooter>
        </Card>
    );
};