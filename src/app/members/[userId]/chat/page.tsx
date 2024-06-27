import React from 'react';
import {CardBody, CardHeader} from "@nextui-org/card";
import {Divider} from "@nextui-org/react";

export default function ChatPage() {
    return (
        <>
            <CardHeader className={'text-2xl font-semibold text-secondary'}>
                Chat
            </CardHeader>
            <Divider/>
            <CardBody>
                Chat goes here
            </CardBody>
        </>
    );
};