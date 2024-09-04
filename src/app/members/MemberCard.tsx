// This component renders a card for a member.
// It displays the member's image, name, age, and city.
// It also includes a like button and a presence dot to indicate if the member is online.

'use client';

import React, {useState} from 'react';
import {Member} from ".prisma/client";
import {Card, CardFooter, Image} from "@nextui-org/react";
import Link from "next/link";
import {calculateAge, transformImageUrl} from "@/lib/util";
import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import {toggleLikeMember} from "@/app/actions/likeActions";

type Props = {
    member: Member, // Member data
    likeIds: string[] // List of liked member IDs
}

export default function MemberCard({member, likeIds}: Props) {

    const [hasLiked, setHasLiked] = useState(likeIds.includes(member.userId)); // State for like status
    const [loading, setLoading] = useState(false); // State for loading status

    async function toggleLike(){
        setLoading(true); // Set loading state to true

        try{
            await toggleLikeMember(member.userId, hasLiked); // Toggle like status
            setHasLiked(!hasLiked); // Update like status

        }catch (error){
            console.error(error); // Log any errors
        }finally {
            setLoading(false); // Set loading state to false
        }
    }

    const preventLinkAction= (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default link action
        e.stopPropagation(); // Stop event propagation
    }

    return (
        <Card
            fullWidth
            as={Link}
            href={`/members/${member.userId}`} // Link to member's page
            isPressable
        >
            <Image
                isZoomed
                alt={member.name} // Member's name as alt text
                width={300}
                src={ transformImageUrl(member.image)  || '/images/user.png'} // Member's image or default image
                className='aspect-square object-cover'
            />

            <div onClick={preventLinkAction}>
                <div className={'absolute top-3 right-3 z-50'}>
                    <LikeButton loading={loading} toggleLike={toggleLike} hasLiked={hasLiked} /> {/* Like button */}
                </div>
                <div className={'absolute top-2 left-3 z-50'}>
                    <PresenceDot member={member}/> {/* Presence dot */}
                </div>
            </div>
            <CardFooter className='flex justify-start bg-black overflow-hidden absolute bottom-0 z-10 bg-dark-gradient'>
                <div className='flex flex-col text-white'>
                    <span className='font-semibold'>{member.name}, {calculateAge(member.dateOfBirth)}</span> {/* Member's name and age */}
                    <span className='text-sm'>{member.city}</span> {/* Member's city */}
                </div>
            </CardFooter>
        </Card>
    );
};