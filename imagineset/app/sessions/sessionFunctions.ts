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

export async function updateSessionName(sessionID: string, newSessionName: string) {
  const updateSession = await prisma.pipelineSession.update({
    where: {
      id: sessionID,
    },
    data: {
      session_name: newSessionName,
    },
  })
  revalidatePath('/')
  return 'updated'
}

export async function updatePrivacyAccess(sessionId: string) {
  const session = await prisma.pipelineSession.findUnique({
    where: {
      id: sessionId
    }
  })

  await prisma.pipelineSession.update({
    where: {
      id: sessionId,
    },
    data: {
      private: !(session?.private),
    },
  })
  revalidatePath('/')
}