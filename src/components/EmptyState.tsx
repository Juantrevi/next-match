import React from 'react';
import {Card, CardBody, CardHeader} from "@nextui-org/card";

export default function EmptyState() {
    return (
        <div className={'flex justify-center items-center mt-20'}>

            <Card className={'p-5'}>
                <CardHeader className={'text-3xl text-secondary'}>
                    There are no result for this filter
                </CardHeader>
                <CardBody className={'text-center'}>
                    Please select a different filter
                </CardBody>
            </Card>

        </div>
    );
};