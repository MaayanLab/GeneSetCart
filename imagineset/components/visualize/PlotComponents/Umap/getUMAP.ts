'use server'
import { readFileSync } from 'fs';
import path from 'path';

export async function loadDataFileExample() {
    const exampleSet = readFileSync(
        path.resolve('public/examples', './example data file.csv'),
        { encoding: 'utf8', flag: 'r' }
    )
    return exampleSet
}


type UMAPOptionsType = {
    assignGroups: boolean
    filetype? : string
    dataGroups?: {[key: string] : string}
    minDist: number
    spread: number
    nNeighbors: number 
    randomState: number
}

export async function getUMAP(genesetDict: {
    [key: string]: string[];
}, umapOptions: UMAPOptionsType){
    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found')
    const req = await fetch(API_BASE_URL + '/api/getUMAP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'genesetGenes': genesetDict, 'umapOptions': umapOptions }),
    })
    const parsedUMAP = await req.json()
    return parsedUMAP
}