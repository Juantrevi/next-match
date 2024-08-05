'use client';

import React from 'react';
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {GiPadlock} from "react-icons/gi";
import {Input} from "@nextui-org/input";
import {Button} from "@nextui-org/react";
import {registerSchema, RegisterSchema} from "@/lib/schemas/registerSchema";
import {registerUser} from "@/app/actions/authActions";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {handleFormServerErrors} from "@/lib/util";
import UserDetailsForm from "@/app/(auth)/register/UserDetailsForm";


export default function RegisterForm() {
    const router = useRouter();

    const methods = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        mode: 'onTouched'
    });

    const {handleSubmit, setError, formState: {errors, isValid, isSubmitting}} = methods;

    const onSubmit = async (data: RegisterSchema) => {

        const result = await registerUser(data);

        if(result.status === 'success'){
            toast.success('User registered successfully');
            router.push('/login');
            console.log('User registered successfully');
        } else {
            handleFormServerErrors(result, setError);
        }
    }



    return (
        <Card className='w-2/5 mx-auto'>
            <CardHeader className='flex flex-col item-center justify-center'>
                <div className='flex flex-col gap-2 items-center text-secondary'>
                    <div className='flex flex-row items-center gap-3'>
                        <GiPadlock size={30}/>
                        <h1 className='text-3xl font-semibold'>Register</h1>
                    </div>
                    <p className='text-neutral-500'>Welcome to NextMatch</p>
                </div>
            </CardHeader>
            <CardBody>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className='space-y-4'>
                        <UserDetailsForm />

                            <Button
                                isLoading={isSubmitting}
                                isDisabled={!isValid}
                                fullWidth
                                color={'secondary'}
                                type={'submit'}>
                                Register
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardBody>
        </Card>
    );
};