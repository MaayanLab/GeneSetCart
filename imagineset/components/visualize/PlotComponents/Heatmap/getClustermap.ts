'use server'

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
}){
    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found')
    const req = await fetch(API_BASE_URL + '/api/getHeatmap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'genesets_dict': genesetDict }),
    })
    const response = await req.text()
    return response
}