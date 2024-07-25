'use server'

import {prisma} from "@/lib/prisma";
import {auth} from "@/auth";
import {toast} from "react-toastify";
import {Photo} from ".prisma/client";
import {UserFilters} from "@/types";
import {addYears} from "date-fns";

export async function getMembers(searchParams: UserFilters) {
  const session = await auth();
  if(!session?.user) {
    return null;
  }

  const ageRange = searchParams?.ageRange?.toString()?.split(',') || [18, 99];
  const currentDate = new Date();
  const minDob = addYears(currentDate, -ageRange[1] - 1);
  const maxDob = addYears(currentDate, -ageRange[0]);

  try {
    return prisma.member.findMany({
      where: {
        AND: [
          {dateOfBirth: {gte: minDob}},
          {dateOfBirth: {lte: maxDob}},
        ],
        NOT: {
          userId: session.user.id
        }
      }
    });
  }catch(error) {
    console.error(error)
    throw error;
  }
}

export async function getMemberByUserId(userId: string) {
  try {
    return prisma.member.findUnique({
      where: {
        userId
      }
    });
  }catch(error) {
    console.error(error)
  }
}

export async function getMemberPhotosByUserId(userId: string) {

  const member = await prisma.member.findUnique(
      {
        where: {userId},
        select: {photos: true}

      }
  )

  if (!member) {
    return null
  }

  return member.photos.map(p => p) as Photo[];

}