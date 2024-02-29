'use server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { readFileSync } from 'fs'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import path from 'path'
import { type GeneSet, type Gene } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { searchResultsType } from '@/components/assemble/DCCFetch/DCCUpload'

// For Assemble Single Upload
export async function loadTxtExample() {
    const exampleSet = readFileSync(
        path.resolve('src/public/examples', './txt_example.txt'),
        { encoding: 'utf8', flag: 'r' }
    )
    return exampleSet
}

export async function checkValidGenes(genes: string) {
    const genesArray = genes.split('\n').filter((gene) => gene != '')
    const possibleGenes = await prisma.gene.findMany(
        {
            select:
            {
                gene_symbol: true,
            }
        }
    );
    const allGenes = possibleGenes.map((geneRecord) => geneRecord.gene_symbol)
    const genesFound = genesArray.filter((gene) => allGenes.includes(gene))
    return genesFound
}

export async function addToSessionSets(gene_list: string[], sessionId: string, genesetName: string, description: string) {
    // get gene objects
    const geneObjects = await Promise.all(gene_list.map(async (gene) => await prisma.gene.findFirst({
        where: {
            gene_symbol: gene
        }
    })));

    const geneObjectIds = geneObjects.map((geneObject) => { return ({ id: geneObject?.id }) })
    // get user
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user?.id
        }
    })
    if (user === null) return redirect("/auth/signin?callbackUrl=/")

    // get sets that are already in session 
    const sessionOldSets = await prisma.pipelineSession.findUnique({
        where: {
            id: sessionId,
            user_id: user.id
        },
        select: {
            gene_sets: true
        }
    })

    const oldSetsArray = sessionOldSets?.gene_sets ? sessionOldSets?.gene_sets : []
    const newGeneset = await prisma.geneSet.create({
        data: {
            name: genesetName,
            description: description,
            session_id: sessionId,
            genes: {
                connect: geneObjectIds,
            },
        }
    })


    const updatedSession = await prisma.pipelineSession.update({
        where: {
            id: sessionId,
            user_id: user.id
        },
        data: {
            gene_sets: {
                set: [...oldSetsArray, newGeneset],
            },
            lastModified: new Date()
        },
    })

    revalidatePath('/')
    return 'success'
}

type GMTGenesetInfo = {
    id: number,
    genesetName: string,
    genes: string[]
}


export async function addMultipleSetsToSession(rows: (GMTGenesetInfo | undefined)[], sessionId: string) {
    for (const row of rows) {
        if (row) {
            const validGenes = await checkValidGenes(row.genes.toString().replaceAll(',', '\n'))
            const added = await addToSessionSets(validGenes, sessionId, row.genesetName, '')
        }
    }
    return 'done'
}

export async function addMultipleSetsCFDE(rows: (searchResultsType | undefined)[], sessionId: string) {
    for (const row of rows) {
        if (row) {
            const response = await fetch('https://maayanlab.cloud/Enrichr/geneSetLibrary?' + new URLSearchParams(`libraryName=${row.libraryName}&term=${row.genesetName}&mode=json`))
            const data = await response.json()
            const genes = data[row.genesetName]
            const validGenes = await checkValidGenes(genes.toString().replaceAll(',', '\n'))
            const added = addToSessionSets(validGenes, sessionId, row.genesetName + ` (${row.dcc})`, '')
        }
    }
    return 'done'
}

