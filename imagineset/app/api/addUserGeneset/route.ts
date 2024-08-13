import { addToAddedGenesets } from '@/app/shallowcopy';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: Request) {
    const data = await request.json();
    const genesetName = data['term']
    const genes = data['genes']
    const description = data['description']
    let validate = true
    if ('validate' in data) {
        validate = data['validate']
    }
    if (genes.length < 1) return NextResponse.json({ error: 'Empty gene set' }, { status: 400 })
    if (genesetName === '') return NextResponse.json({ error: 'No gene set name' }, { status: 400 })
    try {
        const addedGenesetId = await addToAddedGenesets(genes, genesetName, description, validate)
        return NextResponse.json({ geneset_url: process.env.PUBLIC_URL + `/assemble?type=single&geneset_id=${addedGenesetId}&add=true`}, {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers":
                    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
                "Access-Control-Max-Age": "86400",
            }
        })
    } catch (err) {
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
