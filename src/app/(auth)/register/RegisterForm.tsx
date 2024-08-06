'use client';

import React, {useState} from 'react';
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {GiPadlock} from "react-icons/gi";
import {Input} from "@nextui-org/input";
import {Button} from "@nextui-org/react";
import {profileSchema, registerSchema, RegisterSchema} from "@/lib/schemas/registerSchema";
import {registerUser} from "@/app/actions/authActions";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {handleFormServerErrors} from "@/lib/util";
import UserDetailsForm from "@/app/(auth)/register/UserDetailsForm";
import ProfileForm from "@/app/(auth)/register/ProfileForm";


const stepSchemas = [registerSchema, profileSchema];

export default function RegisterForm() {
    const [activeStep, setActiveStep] = useState(0);
    const currentValidationSchema = stepSchemas[activeStep];

    const router = useRouter();

    const methods = useForm<RegisterSchema>({
        resolver: zodResolver(currentValidationSchema),
        mode: 'onTouched'
    });

    const {handleSubmit, setError, getValues, formState: {errors, isValid, isSubmitting}} = methods;

    const onSubmit = async (data: RegisterSchema) => {

        const result = await registerUser(getValues());

        if(result.status === 'success'){
            toast.success('User registered successfully');
            router.push('/register/success');
            console.log('User registered successfully');
        } else {
            handleFormServerErrors(result, setError);
        }
    }

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <UserDetailsForm/>;
            case 1:
                return <ProfileForm/>;
            default:
                return 'Unknown step';
        }
    }

    const onBack = () => {
        setActiveStep(prev => prev - 1);
    }

    const onNext = async () => {
        if (activeStep === stepSchemas.length - 1) {
            await handleSubmit(onSubmit)(); // Call handleSubmit with onSubmit
        } else {
            setActiveStep(prev => prev + 1);
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
                    <form onSubmit={handleSubmit(onNext)}>
                        <div className='space-y-4'>
                            {getStepContent(activeStep)}
                            <div className={'flex flex-row items-center gap-6'}>
                                {activeStep !== 0 && (
                                    <Button
                                        onClick={onBack}
                                        fullWidth>
                                        Back
                                    </Button>
                                )}
                                <Button
                                    isLoading={isSubmitting}
                                    isDisabled={!isValid}
                                    fullWidth
                                    color={'secondary'}
                                    type={'submit'}>
                                    {activeStep === stepSchemas.length - 1 ? 'Submit' : 'Next'}
                                </Button>
                            </div>

                        </div>
                    </form>
                </FormProvider>
            </CardBody>
        </Card>
    );
};