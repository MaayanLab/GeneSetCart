'use server'

import prisma from "@/lib/prisma"

export async function getPrivateSession(sessionId: string){
    const session = await prisma.pipelineSession.findUnique({
        where: {
            id: sessionId
        }
    })
    return session ? session.private : null
}