import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const pmcid = searchParams.get("pmcid");
    if (!pmcid) return NextResponse.json({ error: 'Empty gene set' }, { status: 400 })
    
    const authorsInfo = await prisma.paperContacts.findMany({
        where: {
            pmcid: pmcid
        }
    })

    return NextResponse.json(authorsInfo, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers":
                "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
            "Access-Control-Max-Age": "86400",
        }
    })

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
