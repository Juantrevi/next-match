import React, {ReactNode} from 'react';
import {CardBody, CardHeader} from "@nextui-org/card";
import {CardFooter, Divider} from "@nextui-org/react";

type Props = {
    header: ReactNode | string;
    body: ReactNode;
    footer?: ReactNode;
}

export default function CardInnerWrapper({header, body, footer}: Props) {
    return (
        <>
            <CardHeader>
                {typeof header === 'string' ? (
                    <div className={'text-2xl font-semibold text-secondary chat'}>
                        {header}
                    </div>
                ) :
                    <>
                        {header}
                    </>
                }
            </CardHeader>
            <Divider/>
            <CardBody>
                {body}
            </CardBody>
            {footer && (
                <CardFooter>
                    {footer}
                </CardFooter>
            )}
        </>
    );
};