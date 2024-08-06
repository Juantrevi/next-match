'use client'

import React from 'react';
import {useFormContext} from "react-hook-form";
import {Input, Textarea} from "@nextui-org/input";
import {Select, SelectItem} from "@nextui-org/react";
import {format, subYears} from "date-fns";

export default function ProfileForm() {
    const {register, setValue, getValues, formState: {errors}} = useFormContext();
    const genderList = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
    ]

    return (
        <div className={'space-y-4'}>
            <Select
                defaultSelectedKeys={getValues('gender')}
                aria-label={'Select Gender'}
                label='Gender'
                variant='bordered'
                {...register('gender', )}
                isInvalid={!!errors.gender}
                errorMessage={errors.gender?.message as string}
                onChange={e => setValue('gender', e.target.value)}
            >
                {genderList.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                        {item.label}
                    </SelectItem>
                    ))}
            </Select>
            <Input
                defaultValue={getValues('dateOfBirth')}
                label='Date of birth'
                type={'date'}
                variant='bordered'
                max={format((subYears(new Date(), 18)), 'yyyy-MM-dd')}
                {...register('dateOfBirth', )}
                isInvalid={!!errors.dateOfBirth}
                errorMessage={errors.dateOfBirth?.message as string}
            />
            <Textarea
                defaultValue={getValues('description')}
                label='description'
                variant='bordered'
                {...register('description', )}
                isInvalid={!!errors.description}
                errorMessage={errors.description?.message as string}
            />
            <Input
                defaultValue={getValues('city')}
                label='City'
                variant='bordered'
                {...register('city', )}
                isInvalid={!!errors.city}
                errorMessage={errors.city?.message as string}
            />
            <Input
                defaultValue={getValues('country')}
                label='Country'
                variant='bordered'
                {...register('country', )}
                isInvalid={!!errors.country}
                errorMessage={errors.country?.message as string}
            />

            {errors.root?.serverError && (
                <p className='text-danger text-sm'>{errors.root.serverError.message}</p>
            )}
        </div>
    );
};