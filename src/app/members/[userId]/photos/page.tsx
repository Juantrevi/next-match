import React from 'react';
import {CardBody, CardHeader} from "@nextui-org/card";
import {Divider} from "@nextui-org/react";
import {getMemberPhotosByUserId} from "@/app/actions/memberActions";
import MemberPhotos from "@/components/MemberPhotos";

export default async function PhotosPage({params}: {params: {userId: string}}) {

    const photos = await getMemberPhotosByUserId(params.userId);

    return (
        <>
            <CardHeader className={'text-2xl font-semibold text-secondary'}>
                Photos
            </CardHeader>
            <Divider/>
            <CardBody>
                <MemberPhotos photos={photos}/>
            </CardBody>
        </>
    );
};