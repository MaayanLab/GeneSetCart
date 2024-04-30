import { addToSessionSets } from '@/app/assemble/[id]/AssembleFunctions ';
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const data = await request.json();
    const genesets = data
    if (genesets.length < 1) return NextResponse.json({ error: 'More than one gene set must be sent in request to be added' }, { status: 400 })
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
        await Promise.all(genesets.map(async (genesetInfo: { genes: string[], term: string, description: string }) => await addToSessionSets(genesetInfo.genes, newSession.id, genesetInfo.term, genesetInfo.description)))
        return NextResponse.json({ session_id: newSession.id }, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers":
                    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
                "Access-Control-Max-Age": "86400",
            },
        })
    } catch {
        return NextResponse.json({ error: 'Error processing request' }, {
            status: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers":
                    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
                "Access-Control-Max-Age": "86400",
            },
        })
    }

}


