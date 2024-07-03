'use client';

import React from 'react';
import ImageUploadButton from "@/components/ImageUploadButton";
import {useRouter} from "next/navigation";
import {CloudinaryUploadWidgetResults} from "next-cloudinary";
import {addImage} from "@/app/actions/userAction";
import {toast} from "react-toastify";

export default function MemberPhotoUpload() {

    const router = useRouter();

    const onAddImage = async (result: CloudinaryUploadWidgetResults) => {
        if (result.info && typeof result.info === 'object'){
            await addImage(result.info.secure_url, result.info.public_id);
            router.refresh();
        }else {
            toast.error('An error occurred while uploading image')
        }
    }

    return (
        <div className={'pt-5 pl-5'}>
            <ImageUploadButton onUploadImage={onAddImage} />
        </div>
    );
};