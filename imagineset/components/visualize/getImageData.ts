'use server'

import { Gene } from "@prisma/client"

export async function getClustermap(genesetDict: {
    [key: string]: string[];
}, heatmapOptions: { diagonal: boolean, palette: string, fontSize: number, disableLabels: boolean, annotationText: boolean }){
    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found') 
    const req = await fetch(API_BASE_URL + '/api/getHeatmap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'genesets_dict': genesetDict, 'display-diagonal': heatmapOptions.diagonal, 'color-palette': heatmapOptions.palette, 'font-size': heatmapOptions.fontSize, 'disable-labels': heatmapOptions.disableLabels, 'annot': heatmapOptions.annotationText }),
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
    isHumanGenes: boolean; 
    otherSymbols: string[]
}[] ){
    let genesetDict: { [key: string]: string[] } = {}
    legendSelectedSets?.forEach((geneset) => {
        const genes = geneset.isHumanGenes ? geneset.genes.map((gene) => gene.gene_symbol) : geneset.otherSymbols
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

export async function getSuperVenn(genesetDict: {[key: string]: string[]}){
    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found') 
    const req = await fetch(API_BASE_URL + '/api/get_supervenn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'genesets_dict': genesetDict }),
    })
    const response = await req.text()
    return response
}

export async function getVenn(genesetDict: {
    [key: string]: string[];
}){
    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found') 
    const req = await fetch(API_BASE_URL + '/api/get_venn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'genesets_dict': genesetDict }),
    })
    const response = await req.text()
    return response
}