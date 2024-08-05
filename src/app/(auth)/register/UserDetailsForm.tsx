'use client'

import React from 'react';
import {Input} from "@nextui-org/input";
import {useFormContext} from "react-hook-form";

export default function UserDetailsForm() {
    const {register, formState: {errors}} = useFormContext();
    return (
        <div className={'space-y-4'}>
            <Input
                defaultValue={''}
                label='Name'
                variant='bordered'
                {...register('name', )}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message as string}
            />
            <Input
                defaultValue={''}
                label='Email'
                variant='bordered'
                {...register('email', )}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message as string}
            />
            <Input
                defaultValue={''}
                label='Password'
                variant='bordered'
                type='password'
                {...register('password', )}
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message as string}
            />

            {errors.root?.serverError && (
                <p className='text-danger text-sm'>{errors.root.serverError.message}</p>
            )}
        </div>
    );
};