'use client';

import React from 'react';
import {Photo} from ".prisma/client";
import {CldImage} from "next-cloudinary";
import {Image} from "@nextui-org/react";
import clsx from "clsx";

type Props = {
    photo: Photo | null;
}

export default function MemberImage({photo}: Props) {
    return (
        <div>
            {photo?.publicId ? (
                <CldImage
                    alt={'Image of member'}
                    src={photo.publicId}
                    width={300}
                    height={300}
                    crop={"fill"}
                    gravity={'faces'}
                    className={clsx('rounded-2xl', {
                        'opacity-40': !photo.isApproved
                    })}
                    priority
                />
            ) : (
                <Image
                    width={220}
                    height={220}
                    src={photo?.url || '/images/user.png'}
                    alt={'Image of user'}
                />
            )}
            {!photo?.isApproved && (
                <div className={'absolute bottom-2 w-full bg-slate-200 p-1'}>
                    <div className={'flex justify-center text-danger font-semibold'}>
                        Awaiting approval
                    </div>
                </div>
            )}
        </div>
    );
};