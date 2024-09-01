// This file defines schemas for user registration and profile forms using the Zod library.
// It also includes a utility function to calculate the user's age based on their date of birth.

import {z} from 'zod';
import {calculateAge} from "@/lib/util";

// Define a schema for the registration form
export const registerSchema = z.object({
    name: z.string().min(3, {
        message: 'Name must be at least 3 characters long', // Validate that the name is at least 3 characters long
    }),
    email: z.string().email({
        message: 'Invalid email address', // Validate that the email is in a valid format
    }),
    password: z.string().min(6, {
        message: 'Password must be at least 6 characters long', // Validate that the password is at least 6 characters long
    }),
});

// Define a schema for the profile form
export const profileSchema = z.object({
    gender: z.string().min(1), // Validate that the gender is provided
    description: z.string().min(1), // Validate that the description is provided
    city: z.string().min(1), // Validate that the city is provided
    country: z.string().min(1), // Validate that the country is provided
    dateOfBirth: z.string().min(1, {
        message: 'Date of birth is required', // Validate that the date of birth is provided
    }).refine(dateString => {
        const age = calculateAge(new Date(dateString));
        return age >= 18; // Validate that the user is at least 18 years old
    }, {
        message: 'You must be at least 18 years old', // Error message if the user is under 18
    }),
});

// Combine the registration and profile schemas into one
export const combinedRegisterSchema = registerSchema.and(profileSchema);

// Define TypeScript types for the schemas
export type ProfileSchema = z.infer<typeof profileSchema>
export type RegisterSchema = z.infer<typeof registerSchema & typeof profileSchema>;