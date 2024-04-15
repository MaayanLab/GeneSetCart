import { authOptions } from '@/lib/auth/authOptions'
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function GMTCross({ params }: { params: { id: string, share: string } }) {
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
        return redirect(`/gmt-cross/${newSessionId}`)
    }
    const user = await prisma.user.findUnique({
        where: {
            id: session.user?.id
        }
    })
    if (user === null) return redirect("/api/auth/signin?callbackUrl=/gmt-cross")

    const newSession = await prisma.pipelineSession.create({
        data: {
            user_id: user.id,
            private: true
        },
    })

    const newSessionId = newSession.id
    return redirect(`/gmt-cross/${newSessionId}`)
}