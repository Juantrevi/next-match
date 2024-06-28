import React from 'react';
import {Spinner} from "@nextui-org/react";

export default function LoadingComponents({label}: {label?: string}) {
    return (
        <div className={'fixed inset-0 flex justify-center items-center'}>
            <Spinner label={label || 'Loading...'} color={'secondary'} labelColor={'secondary'}/>
        </div>
    );
};