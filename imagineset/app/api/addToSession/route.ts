import { addToSessionSets } from '@/app/assemble/[id]/AssembleFunctions ';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const data = await request.json();
    const genesetName = data['term']
    const genes = data['genes']
    const description = data['description']
    const sessionId = data['session_id']
    if (genes.length < 1) return NextResponse.json({ error: 'Empty gene set' }, { status: 400 })
    if (genesetName === '') return NextResponse.json({ error: 'No gene set name' }, { status: 400 })
    try {
        const sessionCart = await prisma.pipelineSession.findUniqueOrThrow({
            where: {
                id: sessionId
            }
        })
        await addToSessionSets(genes, sessionId, genesetName, description)
        return NextResponse.json({ session_id: sessionId }, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers":
                    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
                "Access-Control-Max-Age": "86400",
            }
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(error.code)
            if (error.code === 'P2025') {
                return NextResponse.json({ error: 'Invalid session id' }, {
                    status: 400,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers":
                            "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
                        "Access-Control-Max-Age": "86400",
                    },
                })
            } else {
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

export async function OPTIONS(request: Request) {
    const allowedOrigin = request.headers.get("origin");
    const response = NextResponse.json({}, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": allowedOrigin || "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers":
                "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
            "Access-Control-Max-Age": "86400",
        },
    });

    return response;
}
