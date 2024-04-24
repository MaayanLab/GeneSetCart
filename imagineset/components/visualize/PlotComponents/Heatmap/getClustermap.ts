'use server'

import { Gene } from "@prisma/client"

type UMAPOptionsType = {
    assignGroups: boolean
    filetype? : string
    dataGroups?: {[key: string] : string}
    minDist: number
    spread: number
    nNeighbors: number 
    randomState: number
}

export async function getClustermap(genesetDict: {
    [key: string]: string[];
}, heatmapOptions: {diagonal: boolean}){
    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found') 
    const req = await fetch(API_BASE_URL + '/api/getHeatmap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'genesets_dict': genesetDict, 'display-diagonal': heatmapOptions.diagonal }),
    })
    const response = await req.text()
    return response
}

export async function getClustermapClasses(legendSelectedSets: {
    alphabet: string;
    genes: Gene[];
    id: string;
    name: string;
    description: string | null;
    session_id: string;
    createdAt: Date;
}[] ){
    let genesetDict: { [key: string]: string[] } = {}
    legendSelectedSets?.forEach((geneset) => {
        const genes = geneset.genes.map((gene) => gene.gene_symbol)
        const genesetName = geneset.alphabet
        genesetDict[genesetName] = genes
    })

    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found') 
    // const req = await fetch(API_BASE_URL + '/api/getHeatmap', {
    const req = await fetch(API_BASE_URL + '/api/getClusteredHeatmap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'genesets_dict': genesetDict}),
    })
    const response = await req.json()
    const clusteredClasses = response['clustered_classes']
    return clusteredClasses
}