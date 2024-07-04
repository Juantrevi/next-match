import React from 'react';
import {CardBody, CardHeader} from "@nextui-org/card";
import {Divider} from "@nextui-org/react";
import CardInnerWrapper from "@/components/CardInnerWrapper";
import ChatForm from "@/app/members/[userId]/chat/ChatForm";

export default function ChatPage() {
    return (
        <CardInnerWrapper header={'Chat'} body={<div>Chat goes here</div>} footer={<ChatForm />}/>
    );
};