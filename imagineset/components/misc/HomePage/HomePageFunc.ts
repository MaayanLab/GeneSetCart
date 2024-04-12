'use server'

import { authOptions } from '@/lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'


export const beginNewSession = async () => {
    const session = await getServerSession(authOptions)
    if (!session) {
        const anonymousUserId = process.env.PUBLIC_USER_ID
        const anonymousUser = await prisma.user.upsert({
            where: {
                id: anonymousUserId,
            },
            update: {},
            create: {
                id: anonymousUserId,
                name: 'Anonymous User',
            },
        })
        const newSession = await prisma.pipelineSession.create({
            data: {
                user_id: anonymousUser.id,
                private: false
            },
        })

        const newSessionId = newSession.id
        redirect(`/assemble/${newSessionId}`)
    }
    // if (!session) return redirect("/api/auth/signin?callbackUrl=/")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user?.id
        }
    })
    if (user === null) return redirect("/api/auth/signin?callbackUrl=/")

    const newSession = await prisma.pipelineSession.create({
        data: {
            user_id: user.id,
            private: true
        },
    })

    const newSessionId = newSession.id
    redirect(`/assemble/${newSessionId}`)
}