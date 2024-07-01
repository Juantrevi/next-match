import React from 'react';
import {CardBody, CardHeader} from "@nextui-org/card";
import {Divider, Image} from "@nextui-org/react";
import {getAuthUserId} from "@/app/actions/authActions";
import {getMemberPhotosByUserId} from "@/app/actions/memberActions";

export default async function PhotosPage() {

    const userId = await getAuthUserId();

    const photos = await getMemberPhotosByUserId(userId);

    return (
        <>
            <CardHeader className={'text-2xl font-semibold text-secondary'}>
                Edit Photos
            </CardHeader>
            <Divider/>
            <CardBody>
                <div className={'grid grid-cold-5 gap-3 p-5'}>
                    {photos && photos.map(photo => (
                        <div key={photo.id} className={'relative'}>
                            <Image
                                width={220}
                                height={220}
                                src={photo.url}
                                alt={'Image user'}
                            />
                        </div>
                    ))}
                </div>
            </CardBody>
        </>
    );
};