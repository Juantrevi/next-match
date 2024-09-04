// This module contains server-side actions for managing photos in the admin panel.
// It includes functions to get unapproved photos, approve a photo, and reject a photo.
// These actions ensure that only admins can perform these operations and handle the necessary updates in the database and Cloudinary.

'use server'

import {getUserRole} from "@/app/actions/authActions";
import {prisma} from "@/lib/prisma";
import {Photo} from ".prisma/client";
import {cloudinary} from "@/lib/cloudinary";

export async function getUnapprovedPhotos() {
    try {
        const role = await getUserRole(); // Get the user's role

        if(role != 'ADMIN') throw new Error('Forbidden'); // Check if the user is an admin

        return prisma.photo.findMany({
            where: {
                isApproved: false // Fetch photos that are not approved
            }
        })

    } catch (error) {
        console.log(error); // Log any errors
        throw error;
    }
}

export async function approvePhoto(photoId: string){
    try {
        const role = await getUserRole(); // Get the user's role

        if(role != 'ADMIN') throw new Error('Forbidden'); // Check if the user is an admin

        const photo = await prisma.photo.findUnique({
            where: {id: photoId},
            include: {member: {include: {user: true}}} // Fetch the photo with related member and user data
        });

        if(!photo || !photo.member || !photo.member.user) throw new Error('Cannot approve this image'); // Check if the photo and related data exist

        const {member} = photo;

        const userUpdate = member.user && member.user.image == null ? {image: photo.url} : {}; // Update user image if null
        const memberUpdate = member.image === null ? {image: photo.url} : {}; // Update member image if null

        if(Object.keys(userUpdate).length > 0){
            await prisma.user.update({
                where: {id: member.userId},
                data: userUpdate // Update the user data
            })
        }

        return prisma.member.update({
            where: {id: member.id},
            data: {
                ...memberUpdate,
                photos: {
                    update: {
                        where: {id: photo.id},
                        data: {isApproved: true} // Approve the photo
                    }
                }
            }
        })
    }catch (error) {
        console.log(error); // Log any errors
        throw error;
    }
}

export async function rejectPhoto(photo: Photo){
    try {
        const role = await getUserRole(); // Get the user's role

        if(role != 'ADMIN') throw new Error('Forbidden'); // Check if the user is an admin

        if(photo.publicId){
            await cloudinary.v2.uploader.destroy(photo.publicId); // Delete the photo from Cloudinary
        }

        return prisma.photo.delete({
            where: {id: photo.id} // Delete the photo from the database
        })
    } catch (error) {
        console.log(error); // Log any errors
        throw error;
    }
}