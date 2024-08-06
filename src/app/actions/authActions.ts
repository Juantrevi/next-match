'use server'

// Import necessary modules and schemas
import {combinedRegisterSchema, registerSchema, RegisterSchema} from "@/lib/schemas/registerSchema";
import bcrypt from 'bcryptjs'; // For hashing passwords
import {prisma} from "@/lib/prisma"; // Prisma client for database interactions
import {ActionResult} from "@/types"; // Custom type for action results
import {User} from "@prisma/client"; // Prisma User model
import {LoginSchema} from "@/lib/schemas/loginSchema"; // Schema for login validation
import {auth, signIn, signOut} from "@/auth"; // Authentication functions
import {AuthError} from "next-auth"; // Error types from next-auth
import {redirect} from "next/navigation"; // Redirect function from next/navigation

// Function to sign in a user with email and password
export async function signInUser(data: LoginSchema): Promise<ActionResult<string>>{
    try {
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