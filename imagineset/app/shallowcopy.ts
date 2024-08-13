'use server'
import prisma from "@/lib/prisma";
import { addToSessionSetsGeneObj } from "./assemble/[id]/AssembleFunctions ";
import { Gene, GeneSet, PipelineSession, User } from "@prisma/client";
import { redirect } from "next/navigation";
import Cookies from 'js-cookie'

export async function shallowCopy(user: User,
    sessionInfo:
        (({
            gene_sets: ({
                genes: Gene[];
            } & GeneSet)[]
        } & PipelineSession | null)),
    redirectPage: string,
    anonUser: boolean, 
    searchParams: Record<string, string | string[] | undefined>
) {
    if (sessionInfo) {
        if (sessionInfo.private === false) {
            const sessionSets = sessionInfo.gene_sets // get gene sets of shared session
            const newSession = await prisma.pipelineSession.create({
                data: {
                    user_id: user.id,
                    private: !anonUser

                },
            })
            await Promise.all(sessionSets.map(async (sessionGeneset) => sessionGeneset.isHumanGenes ? await addToSessionSetsGeneObj(sessionGeneset.genes, newSession.id, sessionGeneset.name, sessionGeneset.description ? sessionGeneset.description : '', user, [], true) : await addToSessionSetsGeneObj([], newSession.id, sessionGeneset.name, sessionGeneset.description ? sessionGeneset.description : '', user, sessionGeneset.otherSymbols, false)))
            const queryParamString = Object.keys(searchParams).map((key) => `${key}=${searchParams[key]}`).join('&')
            const inOneDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            Cookies.set('session_id', newSession.id, { secure: true, expires: inOneDay, sameSite: 'None' })
            return redirect(Object.values(searchParams).includes(undefined) ? `/${redirectPage}/${newSession.id}` : `/${redirectPage}/${newSession.id}?${queryParamString}`)
        } else {
            return redirect('/') // redirect to homepage if session does not exist or is a private session
        }
    } else {
        return redirect('/') // redirect to homepage if session does not exist or is a private session
    }
}

export async function addToAddedGenesets(gene_list: string[], genesetName: string, description: string, validate: boolean){
        // get gene objects
        // TODO: allow users to add gene sets using API when the gene sets are other 
        if (genesetName === '') throw new Error('Empty gene set name')
        let otherSymbolsArray : string[] = []
        let geneObjectIds : {
            id: string | undefined;
        }[] = []
        if (validate) {
            const geneObjects = await Promise.all(gene_list.map(async (gene) => await prisma.gene.findFirst({
                where: {
                    gene_symbol: {
                        equals: gene,
                        mode: 'insensitive'
                    }
                }
            })));
        
            if (geneObjects.length === 0) throw new Error('No valid genes in gene set')
            geneObjectIds = geneObjects.map((geneObject) => { return ({ id: geneObject?.id }) }).filter((geneObject) => geneObject.id !== undefined)
        } else {
            otherSymbolsArray = gene_list.filter((gene) => gene != '')
            if (otherSymbolsArray.length === 0) throw new Error('No valid genes in gene set')
        }
        const addedGeneset = await prisma.addedGeneset.create({
            data: {
                name: genesetName,
                description: description,
                genes: {
                    connect: geneObjectIds,
                },
                otherSymbols: otherSymbolsArray
            }
        })
        return addedGeneset.id
}

export async function getGenesetInfo (genesetId: string) {
    const geneset = await prisma.addedGeneset.findUnique({
        where: {
            id: genesetId
        }, 
        include: {
            genes: true
        }
    })
    return geneset
}