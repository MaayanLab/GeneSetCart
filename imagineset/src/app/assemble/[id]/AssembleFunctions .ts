'use server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import { readFileSync } from 'fs'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import path from 'path'
import { type GeneSet, type Gene } from '@prisma/client'
import { revalidatePath } from 'next/cache'

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

    const geneObjectIds = geneObjects.map((geneObject) => {return ({id : geneObject?.id})})
    // get user
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/auth/signin?callbackUrl=/")
    const user = await prisma.user.findUnique({
        where: {
            id: session.user?.id
        }
    })
    if (user === null) return redirect("/auth/signin?callbackUrl=/")

    // get sers that are already in session 
    const sessionOldSets = await prisma.pipelineSession.findUnique({
        where:{
            id:sessionId, 
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
        },
    })

    revalidatePath('/')
    return 'success'
}
