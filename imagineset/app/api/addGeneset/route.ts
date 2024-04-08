import { addToSessionSets } from '@/app/assemble/[id]/AssembleFunctions '
import { authOptions } from '@/lib/auth/authOptions'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const url = new URL(request.url)
    const sessionId = url.searchParams.get("sessionId")
    if (sessionId) {
        const sessionData = await prisma.tempSessions.findUnique({
            where: {
                id: sessionId
            }
        })

        const session = await getServerSession(authOptions)
        if (!session) return redirect(`/api/auth/signin?callbackUrl=/api/addGeneset?sessionId=${sessionId}`)
        const user = await prisma.user.findUnique({
            where: {
                id: session.user?.id
            }
        })
        if (user === null) return redirect(`/api/auth/signin?callbackUrl=/api/addGeneset?sessionId=${sessionId}`)

        const newSession = await prisma.pipelineSession.create({
            data: {
                user_id: user.id,
            },
        })

        const newSessionId = newSession.id

        const genes = sessionData?.genes
        const genesetName = sessionData?.genesetName
        if (!genes) { return NextResponse.json({ error: 'Error in parsing genes' }, { status: 500 }) }
        if (genes.length === 0) { return NextResponse.json({ error: 'Empty gene set' }, { status: 500 }) }
        if (!genesetName) { return NextResponse.json({ error: 'No gene set name provides' }, { status: 500 }) }
        const addSet = await addToSessionSets(genes, newSessionId, genesetName, '')

        return NextResponse.redirect(new URL(`/assemble/${newSessionId}`, request.url))
    } else {
        return NextResponse.json({ error: 'No sessionId parameter' }, { status: 500 })
    }
}


export async function POST(request: Request) {
    const data = await request.json();
    const genesetName = data['term']
    const genes = data['genes']
    try{
        const newTempSession = await prisma.tempSessions.create({
            data: {
                genesetName: genesetName,
                genes: genes
            },
            select: {
                id: true
            }
        })

        const newSessionId = newTempSession.id
        return NextResponse.json({ text: newSessionId }, { status: 200 })
    } catch {
        return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
    }

}
