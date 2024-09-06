// This module contains server-side actions for managing members and their photos.
// It includes functions to get members, get a member by user ID, get member photos by user ID, and update the last active timestamp.
// These actions handle authentication, validation, and database interactions using Prisma.

'use server'

import {prisma} from "@/lib/prisma"; // Prisma client for database interactions
import {auth} from "@/auth"; // Authentication functions
import {toast} from "react-toastify"; // Toast notifications
import {Member, Photo} from ".prisma/client"; // Prisma Member and Photo models
import {GetMemberParams, PaginatedResponse, UserFilters} from "@/types"; // Custom types for member parameters and responses
import {addYears} from "date-fns"; // Date manipulation functions
import {getAuthUserId} from "@/app/actions/authActions"; // Function to get authenticated user ID

// Function to get members based on filters and pagination
export async function getMembers({
    ageRange = '18,100',
    gender = 'male,female',
    orderBy = 'updated',
    pageNumber = '1',
    pageSize = '12'
}: GetMemberParams): Promise<PaginatedResponse<Member>> {
    const userId = await getAuthUserId(); // Get authenticated user ID

    const [minAge, maxAge] = ageRange?.split(','); // Split age range into min and max age
    const currentDate = new Date();
    const minDob = addYears(currentDate, -maxAge - 1); // Calculate minimum date of birth
    const maxDob = addYears(currentDate, -minAge); // Calculate maximum date of birth

    const selectedGender = gender?.split(','); // Split gender into an array

    const page = parseInt(pageNumber); // Parse page number
    const limit = parseInt(pageSize); // Parse page size

    const skip = (page - 1) * limit; // Calculate skip value for pagination

    try {
        const count = await prisma.member.count({
            where: {
                AND: [
                    {dateOfBirth: {gte: minDob}},
                    {dateOfBirth: {lte: maxDob}},
                    {gender: {in: selectedGender}},
                ],
                NOT: {
                    userId: userId
                }
            },
        }); // Count total members matching the filters

        const members = await prisma.member.findMany({
            where: {
                AND: [
                    {dateOfBirth: {gte: minDob}},
                    {dateOfBirth: {lte: maxDob}},
                    {gender: {in: selectedGender}},
                ],
                NOT: {
                    userId: userId
                }
            },
            orderBy: {[orderBy]: 'desc'},
            skip,
            take: limit,
        }); // Fetch members matching the filters with pagination

        return {
            items: members,
            totalCount: count
        }; // Return paginated response with members and total count

    } catch (error) {
        console.error(error); // Log any errors
        throw error; // Throw error
    }
}

// Function to get a member by user ID
export async function getMemberByUserId(userId: string) {
    try {
        return prisma.member.findUnique({
            where: {
                userId
            }
        }); // Return member found by user ID
    } catch (error) {
        console.error(error); // Log any errors
        throw error; // Throw error
    }
}

// Function to get member photos by user ID
export async function getMemberPhotosByUserId(userId: string) {
    const currentUserId = await getAuthUserId(); // Get authenticated user ID

    const member = await prisma.member.findUnique({
        where: {userId},
        select: {
            photos: {
                where: currentUserId === userId ? {} : {isApproved: true},
            }
        }
    }); // Fetch member photos with approval check

    if (!member) {
        return null; // Return null if member not found
    }

    return member.photos as Photo[]; // Return member photos
}

// Function to update the last active timestamp for the authenticated user
export async function updateLastActive() {
    const userId = await getAuthUserId(); // Get authenticated user ID

    try {
        return prisma.member.update({
            where: {userId},
            data: {
                updated: new Date()
            }
        }); // Update last active timestamp
    } catch (error) {
        console.error(error); // Log any errors
        throw error; // Throw error
    }
}