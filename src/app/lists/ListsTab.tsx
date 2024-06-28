'use client'

import React, {Key, useTransition} from 'react';
import {Member} from ".prisma/client";
import {Tab, Tabs} from "@nextui-org/tabs";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import MemberCard from "@/app/members/MemberCard";
import LoadingComponents from "@/components/LoadingComponents";

type Props = {
    members: Member[];
    likeIds: string[];
}

export default function ListsTab({members, likeIds}: Props) {

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathName = usePathname();
    const [isPending, startTransition] = useTransition();

    const tabs = [
        {id: 'source', label: 'Members I have liked'},
        {id: 'target', label: 'Members who have liked me'},
        {id: 'mutual', label: 'Mutual likes'},

    ]

    function handleTabChange(key: Key) {
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            params.set('type', key.toString());
            router.replace(`${pathName}?${params.toString()}`);
        })

    }

    return (
        <div className={'flex w-full flex-col mt-10 gap-5'}>
            <Tabs
            aria-label={'Like tabs'}
            items={tabs}
            color={'secondary'}
            onSelectionChange={(key) => handleTabChange(key)}
            >

                {(item) => (
                    <Tab key={item.id} title={item.label}>
                        {isPending ? (
                            <LoadingComponents />
                        ) : (
                            <>
                                {members.length > 0 ? (
                                    <div className={'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8'}>
                                        {members.map(member => (
                                            <MemberCard key={member.id} member={member} likeIds={likeIds} />
                                        ))}

                                    </div>
                                ) : (
                                    <div>No Members for this filter</div>
                                )}
                            </>
                        )}
                    </Tab>
                )}

            </Tabs>
        </div>
    );
};