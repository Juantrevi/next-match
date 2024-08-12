'use client';

import React from 'react';
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {GiPadlock} from "react-icons/gi";
import {Input} from "@nextui-org/input";
import {Button} from "@nextui-org/react";
import {useForm} from "react-hook-form";
import {loginSchema, LoginSchema} from "@/lib/schemas/loginSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {signInUser} from "@/app/actions/authActions";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import Link from "next/link";
import SocialLogin from "@/app/(auth)/login/SocialLogin";


// Define the LoginForm component
export default function LoginForm() {
    const router = useRouter();

    // Use the useForm hook from react-hook-form to manage your form state
    // The form is validated using the zodResolver with your loginSchema
    // The form validation mode is set to 'onTouched', which means validation is triggered when the input loses focus
    const {
        register,
        handleSubmit,
        formState: {errors, isValid, isSubmitting}
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        mode: 'onTouched'
    });

    // Define the onSubmit function that will be called when the form is submitted
    // This function takes the form data as a parameter
    const onSubmit = async (data: LoginSchema) => {
        // Call the signInUser function with the form data
        // This function is asynchronous, so we wait for it to complete using await
        const result = await signInUser(data);

        // If the sign in was successful, redirect the user to the '/members' page and refresh the page
        if(result.status === 'success'){
            router.push('/members');
            router.refresh();
        } else {
            // If the sign in was not successful, show a toast notification with the error message
            toast.error(result.error as string);
        }
    };


    return (
        <Card className='w-2/5 mx-auto'>
            <CardHeader className='flex flex-col item-center justify-center'>
                <div className='flex flex-col gap-2 items-center text-secondary'>
                    <div className='flex flex-row items-center gap-3'>
                        <GiPadlock size={30}/>
                        <h1 className='text-3xl font-semibold'>Login</h1>
                    </div>
                    <p className='text-neutral-500'>Welcome back to NextMatch</p>
                </div>
            </CardHeader>
            <CardBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='space-y-4'>
                        <Input
                            defaultValue={'karen@test.com'}
                            label='Email'
                            variant='bordered'
                            {...register('email', )}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.message as string}
                         />
                        <Input
                            defaultValue={'password'}
                            label='Password'
                            variant='bordered'
                            type='password'
                            {...register('password', )}
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message as string}
                        />
                        {errors.password && <p className='text-red-500'>{errors.password.message}</p>}
                        <Button
                            isLoading={isSubmitting}
                            isDisabled={!isValid}
                            fullWidth
                            color={'secondary'}
                            type={'submit'}>
                            Login
                        </Button>

                        <SocialLogin />

                        <div className={'flex justify-center hover:underline text-sm'}>
                            <Link href={'/forgot-password'}> Forgot password? </Link>
                        </div>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
};