'use client'

import React from 'react';
import {useRouter} from "next/navigation";
import CardWrapper from "@/components/CardWrapper";
import {FaCheckCircle} from "react-icons/fa";

export default function RegisterSuccessPage() {
    const router = useRouter();
    return (
        <CardWrapper
            headerText={'Please verify your email address'}
            subHeaderText={'You can now login to the app'}
            action={() => router.push('/login')}
            actionLabel={'Go to login'}
            headerIcon={FaCheckCircle}
        />


    );
};