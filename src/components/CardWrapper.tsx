import React, {ReactNode} from 'react';
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {GiPadlock} from "react-icons/gi";
import {IconType} from "react-icons";
import {Button, CardFooter} from "@nextui-org/react";

type Props = {
    body?: ReactNode;
    headerIcon: IconType;
    headerText: string;
    subHeaderText?: string;
    action?: () => void;
    actionLabel?: string;

}

export default function CardWrapper({body, headerIcon: Icon, headerText, subHeaderText, action, actionLabel}: Props) {
    return (
        <div className={'flex items-center justify-center vertical-center'}>
            <Card className='w-2/5 mx-auto p-5'>
                <CardHeader className='flex flex-col item-center justify-center'>
                    <div className='flex flex-col gap-2 items-center text-secondary'>
                        <div className='flex flex-row items-center gap-3'>
                            <Icon size={30}/>
                            <h1 className='text-3xl font-semibold'>{headerText}</h1>
                        </div>
                        {subHeaderText &&
                        <p className='text-neutral-500'>Welcome to NextMatch</p>}
                    </div>
                </CardHeader>
                {body &&
                <CardBody>
                    {body}
                </CardBody>}
                <CardFooter>
                    {action && (
                        <Button onClick={action} fullWidth color={'secondary'} variant={'bordered'}>
                            {actionLabel}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};