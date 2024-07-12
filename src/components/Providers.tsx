'use client';

import React, {ReactNode} from "react";
import {NextUIProvider} from "@nextui-org/react";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {usePresenceChannel} from "@/hooks/usePresenceChannel";

export default function Providers({children}: {children: ReactNode}){

    usePresenceChannel();

    return (
        <NextUIProvider>
            <ToastContainer
            position='bottom-right'
            hideProgressBar
            className='z-50'
            />
            {children}
        </NextUIProvider>
    );
}