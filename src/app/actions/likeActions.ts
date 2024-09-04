// This module contains server-side actions for managing likes and fetching liked members.
// It includes functions to toggle likes, fetch current user like IDs, and fetch liked members.
// These actions handle authentication, validation, and database interactions using Prisma and Pusher.

'use server'

import {prisma} from "@/lib/prisma"; // Prisma client for database interactions
import {getAuthUserId} from "@/app/actions/authActions"; // Function to get authenticated user ID
import {pusherServer} from "@/lib/pusher"; // Pusher server for real-time notifications

// Function to toggle like status for a member
export async function toggleLikeMember(targetUserId: string, isLiked: boolean){
    try {
        const userId = await getAuthUserId(); // Get authenticated user ID

        if(isLiked){
            await prisma.like.delete({
                where: {
                    sourceUserId_targetUserId: {
                        sourceUserId: userId,
                        targetUserId
                    }
                }
            }) // Delete like if already liked
        }else{
            const like = await prisma.like.create({
                data: {
                    sourceUserId: userId,
                    targetUserId
                },
                select: {
                    sourceMember: {
                        select: {
                            name: true,
                            image: true,
                            userId: true
                        }
                    }
                }
            }); // Create like if not already liked
            await pusherServer.trigger(`private-${targetUserId}`, 'like:new', {
                name: like.sourceMember.name,
                image: like.sourceMember.image,
                userId: like.sourceMember.userId
            }) // Trigger Pusher event for new like
        }

    }catch (error){
        console.log(error); // Log any errors
        throw error; // Throw error
    }
}

// Function to fetch current user's liked member IDs
export async function fetchCurrentUserLikeIds(){
    try {
        const userId = await getAuthUserId(); // Get authenticated user ID

        const likeIds =  await prisma.like.findMany({
            where: {
                sourceUserId: userId
            },
            select: {
                targetUserId: true
            }
        }); // Fetch liked member IDs
        return likeIds.map(like => like.targetUserId); // Return liked member IDs

    }catch (error){
        console.log(error); // Log any errors
        throw error; // Throw error
    }
}

// Function to fetch liked members based on type
export async function fetchLikedMembers(type = 'source'){
    try {
        const userId = await getAuthUserId(); // Get authenticated user ID

        switch(type){
            case 'source':
                return await fetchSourceLikes(userId); // Fetch source likes
            case 'target':
                return await fetchTargetLikes(userId); // Fetch target likes
            case 'mutual':
                return await fetchMutualLikes(userId); // Fetch mutual likes
            default:
                return []; // Return empty array for invalid type
        }

    }catch (error){
        console.log(error); // Log any errors
        throw error; // Throw error
    }
}

// Helper function to fetch source likes
async function fetchSourceLikes(userId: string) {
    const sourceList = await prisma.like.findMany({
        where: {
            sourceUserId: userId
        },
        include: {
            targetMember: true
        }
    }); // Fetch source likes
    return sourceList.map(x => x.targetMember); // Return source liked members
}

// Helper function to fetch target likes
async function fetchTargetLikes(userId: string) {
    const targetList = await prisma.like.findMany({
        where: {
            targetUserId: userId
        },
        select: {
            sourceMember: true
        }
    }); // Fetch target likes
    return targetList.map(x => x.sourceMember); // Return target liked members
}

// Helper function to fetch mutual likes
async function fetchMutualLikes(userId: string) {
    const likedUsers = await prisma.like.findMany({
        where: {
            sourceUserId: userId
        },
        select: {
            targetUserId: true
        }
    }); // Fetch liked users

    const likedIds = likedUsers.map(x => x.targetUserId); // Map liked user IDs

    const mutualList = await prisma.like.findMany({
        where: {
            AND: [
                {targetUserId: userId},
                {sourceUserId: {
                in: likedIds}}
            ]
        },
        select: {
            sourceMember: true
        }
    }); // Fetch mutual likes
    return mutualList.map(x => x.sourceMember); // Return mutual liked members
}