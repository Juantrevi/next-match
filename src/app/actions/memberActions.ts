'use server'

import {prisma} from "@/lib/prisma";
import {auth} from "@/auth";
import {toast} from "react-toastify";

export async function getMembers() {
  const session = await auth();
  if(!session?.user) {
    return null;
  }

  try {
    return prisma.member.findMany({
      where: {
        NOT: {
          userId: session.user.id
        }
      }
    });
  }catch(error) {
    console.error(error)
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