'use client';

import React from 'react';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {GiPadlock} from "react-icons/gi";
import {Input} from "@nextui-org/input";
import {Button} from "@nextui-org/react";
import {registerSchema, RegisterSchema} from "@/lib/schemas/registerSchema";
import {registerUser} from "@/app/actions/authActions";
import {any} from "zod";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

// Define the RegisterForm component
export default function RegisterForm() {
    const router = useRouter();

    // Use the useForm hook from react-hook-form to manage your form state
    // The form validation mode is set to 'onTouched', which means validation is triggered when the input loses focus
    // Note: The resolver for zod schema validation is commented out
    const {
        register,
        handleSubmit,
        setError,
        formState: {errors, isValid, isSubmitting}
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        mode: 'onTouched'
    });

    // Define the onSubmit function that will be called when the form is submitted
    // This function takes the form data as a parameter
    const onSubmit = async (data: RegisterSchema) => {
        // Call the registerUser function with the form data
        // This function is asynchronous, so we wait for it to complete using await
        const result = await registerUser(data);

        // If the registration was successful, log a success message to the console
        if(result.status === 'success'){
            toast.success('User registered successfully'); // Display a success toast message
            router.push('/login'); // Redirect the user to the login page
            console.log('User registered successfully');
        } else {
            // If the registration was not successful, check if the error is an array
            if (Array.isArray(result.error)) {
                // If the error is an array, loop through each error
                result.error.forEach((e) => {
                    // For each error, get the field name that caused the error
                    const fieldName = e.path.join('.') as 'email' | 'password' | 'name';
                    // Set an error message for that field in the form
                    setError(fieldName, {message: e.message})
                })
            }else {
                // If the error is not an array, set a general server error message in the form
                setError('root.serverError', {message: result.error})
            }
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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='space-y-4'>
                        <Input
                            defaultValue={''}
                            label='Name'
                            variant='bordered'
                            {...register('name', )}
                            isInvalid={!!errors.name}
                            errorMessage={errors.name?.message}
                        />
                        <Input
                            defaultValue={''}
                            label='Email'
                            variant='bordered'
                            {...register('email', )}
                            isInvalid={!!errors.email}
                            errorMessage={errors.email?.message}
                        />
                        <Input
                            defaultValue={''}
                            label='Password'
                            variant='bordered'
                            type='password'
                            {...register('password', )}
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message}
                        />

                        {errors.root?.serverError && (
                            <p className='text-danger text-sm'>{errors.root.serverError.message}</p>
                        )}

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
            </CardBody>
        </Card>
    );
};