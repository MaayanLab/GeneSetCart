import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export default async function Page(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
    const sessionId = cookies().get('session_id')
    if (sessionId) {
        redirect(`/assemble/${sessionId.value}?type=single&geneset_id=${props.searchParams.geneset_id}&add=${props.searchParams.add}`)
    }
    // if user is not logged in and there is no session id cookie => make new session
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
        redirect(`/assemble/${newSessionId}?type=single&geneset_id=${props.searchParams.geneset_id}`)
    } else { // if user is logged in but there is no session id, then reinstate most recently updated session
        const sessionsRanked = await prisma.pipelineSession.findMany({
            where: {
                user_id: session.user.id
            }, 
            orderBy: {
                lastModified: 'desc'
                
            }
        })
        const mostRecentSessionId = sessionsRanked[0].id
        redirect(`/assemble/${mostRecentSessionId}?type=single&geneset_id=${props.searchParams.geneset_id}`)
    }
}