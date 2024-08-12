'use server'

// Import necessary modules and schemas
import {combinedRegisterSchema, registerSchema, RegisterSchema} from "@/lib/schemas/registerSchema";
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

        const existingUser = await getUserByEmail(data.email);

        if(!existingUser || !existingUser.email) return {status: 'error', error: 'Invalid credentials'};

        if(!existingUser.emailVerified) {
            const token = await generateToken(data.email, TokenType.VERIFICATION);

            await sendVerificationEmail(token.email, token.token);

            return {status: 'error', error: 'Please verify your email before logging in'};
        }

        // Attempt to sign in with provided credentials
        const result = await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false
        });
        // Log and return success message
        console.log(result);
        return {status: 'success', data: result + 'Logged in'};
    } catch (error) {
        console.log(error);
        // Handle specific next-auth errors
        if (error instanceof AuthError){
            switch (error.type){
                case 'CallbackRouteError':
                    return {status: 'error', error: 'Invalid credentials'};
                default:
                    return {status: 'error', error: 'Something went wrong'};
            }
        } else {
            // Handle other errors
            return {status: 'error', error: 'Something else went wrong'};
        }
    }
}

// Function to sign out a user
export async function signOutUser() {
    // Sign out and redirect to home page
    await signOut({redirectTo: '/'});
}

// Function to register a new user
export async function registerUser(data: RegisterSchema): Promise<ActionResult<User>>{
    try {
        // Validate input data against the schema
        const validated = combinedRegisterSchema.safeParse(data);
        if(!validated.success){
            // Return error if validation fails
            return {status: 'error', error: validated.error.errors};
        }
        // Destructure validated data
        const{name, email, password, gender, description, country, dateOfBirth, city} = validated.data;
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if(existingUser){
            // Return error if user exists
            return {status: 'error', error: 'User already exists'};
        }
        // Create new user in the database
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
        });

        const verificationToken = await generateToken(email, TokenType.VERIFICATION);

        await sendVerificationEmail(verificationToken.email, verificationToken.token);

        // Return success with created user data
        return {status: 'success', data: user};
    } catch (error) {
        console.log(error);
        // Handle errors
        return {status: 'error', error: 'Something went wrong.'};
    }
}

// Function to get a user by email
export async function getUserByEmail(email: string) {
    // Return user found by email
    return prisma.user.findUnique({
        where: {
            email
        }
    });
}

// Function to get a user by their ID
export async function getUserById(id: string) {
    // Return user found by ID
    return prisma.user.findUnique({
        where: {
            id
        }
    });
}

// Function to get the authenticated user's ID
export async function getAuthUserId(){
    // Get current session
    const session = await auth()
    const userId = session?.user?.id
    // Throw error if unauthorized
    if(!userId) throw new Error('Unauthorized');
    // Return user ID
    return userId;
}

export async function verifyEmail(token: string): Promise<ActionResult<string>>{
    try {
        const existingToken = await getTokenByToken(token) as any;

        if(!existingToken) {
            return {status: 'error', error: 'Invalid token'};
        }

        const hasExpired = new Date() > existingToken.expires;

        if(hasExpired) {
            return {status: 'error', error: 'Token has expired'};
        }

        const existingUser = await getUserByEmail(existingToken.email)

        await prisma.user.update({
            where: {id: existingUser?.id},
            data: {emailVerified: new Date()}
        })

        await prisma.token.delete({
            where: {id: existingToken.id}
        })

        return {status: 'success', data: 'Email verified'};

    }catch (error) {
        console.log(error);
        throw error;
    }
}

export async function generateResetPasswordEmail(email: string): Promise<ActionResult<string>> {

    try {
        const existingUser = await getUserByEmail(email);

        if(!existingUser) {
            //Change the message so we dont reveal if the email exists
            return {status: 'error', error: 'Email not found'};
        }

        const token = await generateToken(email, TokenType.PASSWORD_RESET);

        await sendPasswordResetEmail(token.email, token.token);

        return {status: 'success', data: 'Password reset email sent'};

    }catch (error) {
        console.log(error);
        return {status: 'error', error: 'Something went wrong'};
    }
}

export async function resetPassword(password: string, token: string | null): Promise<ActionResult<string>>{
    try{

        if(!token) return {status: 'error', error: 'Missing token'};

        const existingToken = await getTokenByToken(token) as any;

        if(!existingToken) {
            return {status: 'error', error: 'Invalid token'};
        }

        const hasExpired = new Date() > existingToken.expires;

        if(hasExpired) {
            return {status: 'error', error: 'Token has expired'};
        }

        const existingUser = await getUserByEmail(existingToken.email)

        if(!existingUser) {
            return {status: 'error', error: 'User not found'};
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: {id: existingUser.id},
            data: {passwordHash: hashedPassword}
        })

        await prisma.token.delete({
            where: {id: existingToken.id}
        })

        return {status: 'success', data: 'Password updated, please log in again'};
    }
    catch (error) {
        console.log(error);
        return {status: 'error', error: 'Something went wrong'};
    }
}