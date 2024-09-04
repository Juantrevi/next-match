// This component renders the Photo Moderation page.
// It fetches unapproved photos and displays them using the MemberPhotos component.

import React from 'react';
import {getUnapprovedPhotos} from "@/app/actions/adminActions"; // Import the function to get unapproved photos
import {Divider} from "@nextui-org/react"; // Import the Divider component
import MemberPhotos from "@/components/MemberPhotos"; // Import the MemberPhotos component

export const dynamic = 'force-dynamic'; // Set the page to be dynamically rendered

export default async function PhotoModerationPage() {
    const photos = await getUnapprovedPhotos(); // Fetch unapproved photos

    return (
        <div className={'flex flex-col mt-10 gap-3'}>
            <h3 className={'text-2xl'}>Photos awaiting moderation</h3> {/* Page title */}
            <Divider/> {/* Divider */}
            <MemberPhotos photos={photos} /> {/* Render the MemberPhotos component with the fetched photos */}
        </div>
    );
};