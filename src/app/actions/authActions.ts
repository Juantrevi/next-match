// This module contains server-side actions for managing user authentication and profile operations.
// It includes functions to sign in, sign out, register, and manage user profiles.
// These actions handle authentication, validation, and database interactions using Prisma and bcrypt.

'use server'

// Import necessary modules and schemas
import {combinedRegisterSchema, ProfileSchema, RegisterSchema} from "@/lib/schemas/registerSchema";
import bcrypt from 'bcryptjs'; // For hashing passwords
import {prisma} from "@/lib/prisma"; // Prisma client for database interactions
import {ActionResult} from "@/types"; // Custom type for action results
import {TokenType, User} from "@prisma/client"; // Prisma User model
import {LoginSchema} from "@/lib/schemas/loginSchema"; // Schema for login validation
import {auth, signIn, signOut} from "@/auth"; // Authentication functions
import {AuthError} from "next-auth"; // Error types from next-auth
import {generateToken, getTokenByToken} from "@/lib/tokens";
import {sendPasswordResetEmail, sendVerificationEmail} from "@/lib/mail"; // Redirect function from next/navigation

// Function to sign in a user with email and password
export async function signInUser(data: LoginSchema): Promise<ActionResult<string>>{
    try {
        const existingUser = await getUserByEmail(data.email); // Get user by email

        if(!existingUser || !existingUser.email) return {status: 'error', error: 'Invalid credentials'}; // Check if user exists

        if(!existingUser.emailVerified) {
            const token = await generateToken(data.email, TokenType.VERIFICATION); // Generate verification token

            await sendVerificationEmail(token.email, token.token); // Send verification email

            return {status: 'error', error: 'Please verify your email before logging in'}; // Prompt email verification
        }

        const result = await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false
        }); // Attempt to sign in

        console.log(result); // Log result
        return {status: 'success', data: result + 'Logged in'}; // Return success message
    } catch (error) {
        console.log(error); // Log error
        if (error instanceof AuthError){
            switch (error.type){
                case 'CallbackRouteError':
                    return {status: 'error', error: 'Invalid credentials'}; // Handle specific error
                default:
                    return {status: 'error', error: 'Something went wrong'}; // Handle other errors
            }
        } else {
            return {status: 'error', error: 'Something else went wrong'}; // Handle other errors
        }
    }
}

// Function to sign out a user
export async function signOutUser() {
    await signOut({redirectTo: '/'}); // Sign out and redirect
}

// Function to register a new user
export async function registerUser(data: RegisterSchema): Promise<ActionResult<User>>{
    try {
        const validated = combinedRegisterSchema.safeParse(data); // Validate input data
        if(!validated.success){
            return {status: 'error', error: validated.error.errors}; // Return error if validation fails
        }
        const{name, email, password, gender, description, country, dateOfBirth, city} = validated.data;
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const existingUser = await prisma.user.findUnique({
            where: { email }
        }); // Check if user already exists
        if(existingUser){
            return {status: 'error', error: 'User already exists'}; // Return error if user exists
        }
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                profileComplete: true,
                member: {
                    create: {
                        name,
                        description,
                        city,
                        country,
                        dateOfBirth: new Date(dateOfBirth),
                        gender
                    }
                }
            }
        }); // Create new user in the database

        const verificationToken = await generateToken(email, TokenType.VERIFICATION); // Generate verification token

        await sendVerificationEmail(verificationToken.email, verificationToken.token); // Send verification email

        return {status: 'success', data: user}; // Return success with created user data
    } catch (error) {
        console.log(error); // Log error
        return {status: 'error', error: 'Something went wrong.'}; // Handle errors
    }
}

// Function to get a user by email
export async function getUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email }
    }); // Return user found by email
}

// Function to get a user by their ID
export async function getUserById(id: string) {
    return prisma.user.findUnique({
        where: { id }
    }); // Return user found by ID
}

// Function to get the authenticated user's ID
export async function getAuthUserId(){
    const session = await auth(); // Get current session
    const userId = session?.user?.id; // Get user ID from session
    if(!userId) throw new Error('Unauthorized'); // Throw error if unauthorized
    return userId; // Return user ID
}

// Function to verify email using a token
export async function verifyEmail(token: string): Promise<ActionResult<string>>{
    try {
        const existingToken = await getTokenByToken(token) as any; // Get token by token

        if(!existingToken) {
            return {status: 'error', error: 'Invalid token'}; // Return error if token is invalid
        }

        const hasExpired = new Date() > existingToken.expires; // Check if token has expired

        if(hasExpired) {
            return {status: 'error', error: 'Token has expired'}; // Return error if token has expired
        }

        const existingUser = await getUserByEmail(existingToken.email); // Get user by email

        await prisma.user.update({
            where: {id: existingUser?.id},
            data: {emailVerified: new Date()}
        }); // Update user email verification status

        await prisma.token.delete({
            where: {id: existingToken.id}
        }); // Delete the token

        return {status: 'success', data: 'Email verified'}; // Return success message
    }catch (error) {
        console.log(error); // Log error
        throw error; // Throw error
    }
}

// Function to generate a password reset email
export async function generateResetPasswordEmail(email: string): Promise<ActionResult<string>> {
    try {
        const existingUser = await getUserByEmail(email); // Get user by email

        if(!existingUser) {
            return {status: 'error', error: 'Email not found'}; // Return error if email not found
        }

        const token = await generateToken(email, TokenType.PASSWORD_RESET); // Generate password reset token

        await sendPasswordResetEmail(token.email, token.token); // Send password reset email

        return {status: 'success', data: 'Password reset email sent'}; // Return success message
    }catch (error) {
        console.log(error); // Log error
        return {status: 'error', error: 'Something went wrong'}; // Handle errors
    }
}

// Function to reset password using a token
export async function resetPassword(password: string, token: string | null): Promise<ActionResult<string>>{
    try{
        if(!token) return {status: 'error', error: 'Missing token'}; // Return error if token is missing

        const existingToken = await getTokenByToken(token) as any; // Get token by token

        if(!existingToken) {
            return {status: 'error', error: 'Invalid token'}; // Return error if token is invalid
        }

        const hasExpired = new Date() > existingToken.expires; // Check if token has expired

        if(hasExpired) {
            return {status: 'error', error: 'Token has expired'}; // Return error if token has expired
        }

        const existingUser = await getUserByEmail(existingToken.email); // Get user by email

        if(!existingUser) {
            return {status: 'error', error: 'User not found'}; // Return error if user not found
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the new password

        await prisma.user.update({
            where: {id: existingUser.id},
            data: {passwordHash: hashedPassword}
        }); // Update user password

        await prisma.token.delete({
            where: {id: existingToken.id}
        }); // Delete the token

        return {status: 'success', data: 'Password updated, please log in again'}; // Return success message
    }
    catch (error) {
        console.log(error); // Log error
        return {status: 'error', error: 'Something went wrong'}; // Handle errors
    }
}

// Function to complete social login profile
export async function completeSocialLoginProfile(data: ProfileSchema): Promise<ActionResult<string>>{
    const session = await auth(); // Get current session

    if(!session) return {status: 'error', error: 'User not found'}; // Return error if user not found

    try {
     const user = await prisma.user.update({
         where: {id: session.user.id},
         data: {
             profileComplete: true,
             member: {
                 create: {
                     name: session.user.name as string,
                     image: session.user.image as string,
                     gender: data.gender,
                     dateOfBirth: new Date(data.dateOfBirth),
                     description: data.description,
                     city: data.city,
                     country: data.country
                 }
             }
         },
         select: {
             accounts: {
                 select: {
                     provider: true
                 }
             }
         }
     }); // Update user profile

        return {status: 'success', data: user.accounts[0].provider}; // Return success message
    }catch (error) {
        console.log(error); // Log error
        return {status: 'error', error: 'Something went wrong'}; // Handle errors
    }
}

// Function to get the authenticated user's role
export async function getUserRole() {
    const session = await auth(); // Get current session

    const role = session?.user.role; // Get user role from session

    if(!role) throw new Error('Not in role'); // Throw error if role not found

    return role; // Return user role
}