import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

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
