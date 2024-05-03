import { authOptions } from '@/lib/auth/authOptions'
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function GMTCross(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
    const qs = props.searchParams;
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
        return redirect((qs.lib1 && qs.lib2) ? `/gmt-cross/${newSessionId}?lib1=${qs.lib1}&lib2=${qs.lib2}`: `/gmt-cross/${newSessionId}`)
    }
    const user = await prisma.user.findUnique({
        where: {
            id: session.user?.id
        }
    })
    if (user === null) return redirect((qs.lib1 && qs.lib2) ? `/api/auth/signin?callbackUrl=/gmt-cross?lib1=${qs.lib1}&lib2=${qs.lib2}` : `/api/auth/signin?callbackUrl=/gmt-cross`)

    const newSession = await prisma.pipelineSession.create({
        data: {
            user_id: user.id,
            private: true
        },
    })

    const newSessionId = newSession.id
    return redirect((qs.lib1 && qs.lib2) ? `/gmt-cross/${newSessionId}?lib1=${qs.lib1}&lib2=${qs.lib2}` : `/gmt-cross/${newSessionId}`)
}