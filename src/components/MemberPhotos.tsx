'use client';

import React, {useState} from 'react';
import MemberImage from "@/components/MemberImage";
import {Tooltip} from "@nextui-org/react";
import StarButton from "@/components/StarButton";
import DeleteButton from "@/components/DeleteButton";
import {Photo} from ".prisma/client";
import {useRouter} from "next/navigation";
import {setMainImage} from "@/app/actions/userAction";

type Props = {
    photos: Photo[] | null;
    editing?: boolean;
    mainImageUrl?: string | null;
}

export default function MemberPhotos({photos, editing, mainImageUrl}: Props) {

    const router = useRouter();
    const [loading, setLoading] = useState({
        type: '',
        isLoading: false,
        id: ''
    })

    const onSetMain = async (photo: Photo) => {
        if (photo.url === mainImageUrl) return null;
        setLoading({isLoading: true, type: 'main', id: photo.id});
        await setMainImage(photo);
        router.refresh();
        setLoading({isLoading: false, type: '', id: ''});
    }

    return (
        <div className={'grid grid-cols-5 gap-3 p-5'}>
            {photos && photos.map(photo => (
                <div key={photo.id} className={'relative'}>
                    <MemberImage photo={ photo } />
                    {editing && (
                        <>
                            <Tooltip content={'Set as main image'}>
                                <div className={'absolute top-3 left-3 z-50'} onClick={() => onSetMain(photo)}>
                                    <StarButton
                                        selected={photo.url === mainImageUrl}
                                        loading={
                                            loading.isLoading &&
                                            loading.type === 'main' &&
                                            loading.id === photo.id
                                        } />
                                </div>
                            </Tooltip>
                            <Tooltip content={'Delete image'}>
                                <div className={'absolute top-3 right-3 z-50'}>
                                    <DeleteButton loading={false} />
                                </div>
                            </Tooltip>
                        </>
                    )}

                </div>
            ))}
        </div>
    );
};