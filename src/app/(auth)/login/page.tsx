// Importing necessary libraries and components
import React from 'react';
import LoginForm from "@/app/(auth)/login/LoginForm";

// This is the main component for the login page
export default function LoginPage() {
    return (
        <div className={'flex items-center justify-center vertical-center'} >
            {/* This div is used to center the LoginForm component on the page
            The 'flex' class applies a flex layout context to its direct children
            The 'items-center' class vertically aligns the direct children in the middle of the div
            The 'justify-center' class horizontally aligns the direct children in the middle of the div
            The 'vertical-center' class is a custom class defined in globals.css to center the card vertically */}
            <LoginForm />
            {/* The LoginForm component is rendered here */}
        </div>
    );
};