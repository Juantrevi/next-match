import React from 'react';
import {Spinner} from "@nextui-org/react";

export default function LoadingComponents({label}: {label?: string}) {
    return (
        <div className={'flex justify-center items-center vertical-center'}>
            <Spinner label={label || 'Loading...'} color={'secondary'} labelColor={'secondary'}/>
        </div>
    );
};