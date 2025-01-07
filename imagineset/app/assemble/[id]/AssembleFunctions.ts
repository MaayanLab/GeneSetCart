'use server'
import prisma from '@/lib/prisma'
import { readFileSync } from 'fs'
import path from 'path'
import { type GeneSet, type Gene, User, addedGeneset } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { searchResultsType } from '@/components/assemble/DCCFetch/DCCUpload'

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
    return genesFound.map(g => g.toUpperCase())
}

export async function convertGeneSpecies(genes: string, species: string) {
    const genesArray = genes.split('\n').filter((gene) => gene != '')
    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found') 
    const req = await fetch(API_BASE_URL + '/api/gene_lookup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            'input_genes': genesArray,
            'species': species
         }),
    })
    if (req.ok) {
        const reqJson = await req.json()
        return reqJson['converted']
    }
}

export async function addToSessionSetsGeneObj(gene_list: Gene[], sessionId: string, genesetName: string, description: string, user: User, otherSymbols: string[], isHumanGenes: boolean) {
    // get gene objects
    if (genesetName === '') throw new Error('Empty gene set name')
    const geneObjects = gene_list.filter((item) => item !== null)
    if (isHumanGenes) {
        if (geneObjects.length === 0) throw new Error('No valid genes in gene set')
        const geneObjectIds = geneObjects.map((geneObject) => { return ({ id: geneObject?.id }) })

        // get sets that are already in session 
        const sessionOldSets = await prisma.pipelineSession.findUnique({
            where: {
                id: sessionId,
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
                otherSymbols: otherSymbols,
            }
        })

        const updatedSession = await prisma.pipelineSession.update({
            where: {
                id: sessionId,
                user_id: user.id
            },
            data: {
                gene_sets: {
                    connect: [...oldSetsArray.filter((geneset) => geneset.id !== undefined).map((geneset) => ({ id: geneset.id })), // Extract id for filtering
                    { id: newGeneset.id }], // Connect newGeneset by id (assuming it's an object with id)),
                    //     connect: [...oldSetsArray, newGeneset].filter((geneset) => geneset.id !== undefined),
                },
                lastModified: new Date()
            },
            include: {
                gene_sets: true
            }
        })
        // revalidatePath('/')
        return 'success'

    } else {
        addToSessionSets([], sessionId, genesetName, description, otherSymbols, isHumanGenes)
    }
}


export async function addToSessionSets(gene_list: string[], sessionId: string, genesetName: string, description: string, otherSymbols: string[], isHumanGenes: boolean) {
    let geneObjectIds;
    if (isHumanGenes) {
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
        geneObjectIds = geneObjects.map((geneObject) => { return ({ id: geneObject?.id }) })
    }


    // get sets that are already in session 
    const sessionOldSets = await prisma.pipelineSession.findUnique({
        where: {
            id: sessionId,
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
                connect: geneObjectIds ? geneObjectIds.filter((geneObject) => geneObject.id !== undefined) : [],
            },
            otherSymbols: otherSymbols,
            isHumanGenes: isHumanGenes,
        }
    })

    const updatedSession = await prisma.pipelineSession.update({
        where: {
            id: sessionId,
        },
        data: {
            gene_sets: {
                connect: [...oldSetsArray.filter((geneset) => geneset.id !== undefined).map((geneset) => ({ id: geneset.id })),
                { id: newGeneset.id }],
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


export async function addMultipleSetsToSession(rows: (GMTGenesetInfo | undefined)[], sessionId: string,  validGeneSymbols: boolean, species: string, isHumanGenes: boolean) {
    for (const row of rows) {
        if (row) {
            const alreadyExists = await checkInSession(sessionId, row.genesetName)
            if (alreadyExists) {
                return { code: 'error', message: `Gene set : ${row.genesetName} already in cart` }
            } else {
                if (isHumanGenes) {
                    const validGenes = await checkValidGenes(row.genes.toString().replaceAll(',', '\n'))
                    const added = await addToSessionSets(validGenes, sessionId, row.genesetName, '', [], true)
                } else if (validGeneSymbols) {
                    const validSymbols = row.genes.filter((item) => item != '')
                    const convertedSymbols = await convertGeneSpecies(validSymbols.join('\n'), species).then((response) => response.filter((g: any) => g))
                    const validHuman = await checkValidGenes(convertedSymbols.join('\n'))
                    const added = await addToSessionSets(validHuman, sessionId, row.genesetName, '', convertedSymbols, false)
                } else {
                    const validSymbols = row.genes.filter((item) => item != '')
                    const added = await addToSessionSets([], sessionId, row.genesetName, '', validSymbols, false)
                }
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
                const added = await addToSessionSets(validGenes, sessionId, row.geneset_1 + ' ∩ ' + row.geneset_2, '', [], true)
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
                const added = await addToSessionSets(validGenes, sessionId, row.genesetName + ` (${row.dcc})`, '', [], true)
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

export async function addToSessionByGenesetId(sessionId: string, geneset: {
    genes: {
        id: string;
        gene_symbol: string;
        synonyms: string;
        description: string | null;
    }[];
} & addedGeneset) {
    const response = await checkInSession(sessionId, geneset.name);
    if (response) {
        return { error: "Gene set already exists in this session!" }
    } else {
        try {
            let isHumanGenes = true;
            let otherSymbols: string[] = [];
            let validGenes = geneset.genes.map((gene) => gene.gene_symbol);
            if (geneset.otherSymbols.length > 0) {
                isHumanGenes = false;
                otherSymbols = geneset.otherSymbols
                validGenes = []
            }
            const result = await addToSessionSets(validGenes, sessionId, geneset.name, geneset.description ? geneset.description : '', otherSymbols, isHumanGenes)
            return { success: "Added" }
        } catch (err: any) {
            if (err.message === 'No valid genes in gene set') {
                return { error: err.message }
            } else {
                return { error: "Error in adding gene set!" }
            }
        }
    }
}