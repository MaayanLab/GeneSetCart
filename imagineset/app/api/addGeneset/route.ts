import { addToSessionSets } from '@/app/assemble/[id]/AssembleFunctions ';
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const data = await request.json();
    const genesetName = data['term']
    const genes = data['genes']
    const description = data['description']
    if (genes.length < 1) return NextResponse.json({ error: 'Empty gene set' }, { status: 400 })
    if (genesetName === '') return NextResponse.json({ error: 'No gene set name' }, { status: 400 })
    try {
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
        await addToSessionSets(genes, newSession.id, genesetName, description)
        return NextResponse.json({ session_id : newSession.id }, { status: 200 })
    } catch {
        return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
    }

}
