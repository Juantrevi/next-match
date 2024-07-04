import React from 'react';
import {CardBody, CardHeader} from "@nextui-org/card";
import {Divider, Image, Tooltip} from "@nextui-org/react";
import {getAuthUserId} from "@/app/actions/authActions";
import {getMemberByUserId, getMemberPhotosByUserId} from "@/app/actions/memberActions";
import StarButton from "@/components/StarButton";
import DeleteButton from "@/components/DeleteButton";
import ImageUploadButton from "@/components/ImageUploadButton";
import MemberPhotoUpload from "@/app/members/edit/photos/MemberPhotoUpload";
import MemberImage from "@/components/MemberImage";
import MemberPhotos from "@/components/MemberPhotos";

export default async function PhotosPage() {

    const userId = await getAuthUserId();
    const member = await getMemberByUserId(userId);
    const photos = await getMemberPhotosByUserId(userId);

    return (
        <>
            <CardHeader className={'flex flex-row justify-between items-center'}>
                <div className={'text-2xl font-semibold text-secondary'}>
                    Edit Photos
                </div>
                <MemberPhotoUpload />
            </CardHeader>
            <Divider/>
            <CardBody>

                <MemberPhotos photos={ photos } editing={true} mainImageUrl={member?.image}/>
            </CardBody>
        </>
    );
};