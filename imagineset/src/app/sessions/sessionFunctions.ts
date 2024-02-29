'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteSessionByID(sessionID: string) {
    const deleteSession = await prisma.pipelineSession.delete({
        where: {
          id: sessionID,
        },
      })
    revalidatePath('/')
    return 'deleted'
}