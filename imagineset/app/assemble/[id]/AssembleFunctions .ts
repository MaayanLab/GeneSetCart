'use server'
import { authOptions } from '@/lib/auth/authOptions'
import prisma from '@/lib/prisma'
import { readFileSync } from 'fs'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import path from 'path'
import { type GeneSet, type Gene } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { searchResultsType } from '@/components/assemble/DCCFetch/DCCUpload'
import { generateCombinations } from '@upsetjs/react'

// For Assemble Single Upload
export async function loadTxtExample() {
    const exampleSet = readFileSync(
        path.resolve('public/examples', './txt_example.txt'),
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
    const allGenes = possibleGenes.map((geneRecord) => geneRecord.gene_symbol.toLowerCase())
    const genesFound = genesArray.filter((gene) => allGenes.includes(gene.toLowerCase()))
    return genesFound
}

export async function addToSessionSetsGeneObj(gene_list: Gene[], sessionId: string, genesetName: string, description: string) {
    // get gene objects
    if (genesetName === '') throw new Error('Empty gene set name')
    const filteredList = gene_list.filter((item) => item !== null) 
    const geneObjects = filteredList

    if (geneObjects.length === 0) throw new Error('No valid genes in gene set')
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
                connect: geneObjectIds.filter((geneObject) => geneObject.id !== undefined),
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

    // revalidatePath('/')
    return 'success'
}



export async function addToSessionSets(gene_list: string[], sessionId: string, genesetName: string, description: string) {
    // get gene objects
    if (genesetName === '') throw new Error('Empty gene set name')
    const geneObjects = await Promise.all(gene_list.map(async (gene) => await prisma.gene.findFirst({
        where: {
            gene_symbol: {
                equals: gene,
                mode: 'insensitive'
            }
        }
    })));

    if (geneObjects.length === 0) throw new Error('No valid genes in gene set')
    const geneObjectIds = geneObjects.map((geneObject) => { return ({ id: geneObject?.id }) })
    // get user
    // const session = await getServerSession(authOptions)
    // if (!session) return redirect("/auth/signin?callbackUrl=/")
    // const user = await prisma.user.findUnique({
    //     where: {
    //         id: session.user?.id
    //     }
    // })
    // if (user === null) return redirect("/auth/signin?callbackUrl=/")

    // get sets that are already in session 
    const sessionOldSets = await prisma.pipelineSession.findUnique({
        where: {
            id: sessionId,
            // user_id: user.id
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
                connect: geneObjectIds.filter((geneObject) => geneObject.id !== undefined),
            },
        }
    })

    const updatedSession = await prisma.pipelineSession.update({
        where: {
            id: sessionId,
            // user_id: user.id
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

type selectedCrossRowType = {
    id: string,
    lib_1: string,
    lib_2: string,
    geneset_1: string,
    geneset_2: string,
    odds_ratio: number,
    pvalue: number,
    n_overlap: number,
    overlap: string[]
}


export async function addMultipleSetsToSession(rows: (GMTGenesetInfo | undefined)[], sessionId: string) {
    for (const row of rows) {
        if (row) {
            const alreadyExists = await checkInSession(sessionId, row.genesetName)
            if (alreadyExists) {
                return { code: 'error', message: `Gene set : ${row.genesetName} already in cart` }
            } else {
                const validGenes = await checkValidGenes(row.genes.toString().replaceAll(',', '\n'))
                const added = await addToSessionSets(validGenes, sessionId, row.genesetName, '')
            }

        }
    }
    revalidatePath('/')
    return { code: 'success' }
}

export async function addMultipleSetsToSessionCross(rows: (selectedCrossRowType | undefined)[], sessionId: string) {
    for (const row of rows) {
        if (row) {
            const alreadyExists = await checkInSession(sessionId, row.geneset_1 + ' ∩ ' + row.geneset_2)
            if (alreadyExists) {
                return { code: 'error', message: `Gene set : ${row.geneset_1 + ' ∩ ' + row.geneset_2} already in cart` }
            } else {
                const validGenes = await checkValidGenes(row.overlap.toString().replaceAll(',', '\n').replaceAll("'", ''))
                const added = await addToSessionSets(validGenes, sessionId, row.geneset_1 + ' ∩ ' + row.geneset_2, '')
            }

        }
    }
    revalidatePath('/')
    return { code: 'success' }
}


export async function addMultipleSetsCFDE(rows: (searchResultsType | undefined)[], sessionId: string) {
    for (const row of rows) {
        if (row) {
            const alreadyExists = await checkInSession(sessionId, row.genesetName + ` (${row.dcc})`)
            if (alreadyExists) {
                return { code: 'error', message: `Gene set : ${row.genesetName} + (${row.dcc}) already in cart` }
            } else {
            const validGenes = row.genes.map((gene) => gene.gene_symbol)
            const added = await addToSessionSets(validGenes, sessionId, row.genesetName + ` (${row.dcc})`, '')
            }
        }
    }
    revalidatePath('/')
    return { code: 'success' }
}

export async function checkInSession(currentSessionId: string, newGeneSetName: string) {
    const sessionGenesets = await prisma.pipelineSession.findUnique({
        where: {
            id: currentSessionId
        },
        select: {
            gene_sets: true
        }
    })
    if (sessionGenesets) {
        const genesetNames = sessionGenesets?.gene_sets.map((geneset) => geneset.name)
        if (genesetNames.includes(newGeneSetName)) {
            return true
        }
    }
    return false
}

