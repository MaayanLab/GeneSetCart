'use server'

import { checkValidGenes } from "@/app/assemble/[id]/AssembleFunctions ";

export async function getGeneshotPredGenes(gene_list: string[], augmentWith: string) {
    const payload = {
        "gene_list": gene_list,
        "similarity": augmentWith
    }
    const response = await fetch('https://maayanlab.cloud/geneshot/api/associate', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    const responseJson = await response.json()
    const associationData = responseJson.association
    const topAssociation = Object.keys(associationData).map((gene) => ({ 'gene': gene, 'simScore': associationData[gene].simScore }))
    const topGenes = topAssociation.sort(function (a, b) {
        return a.simScore - b.simScore;
    }).map((geneInfo) => geneInfo.gene)
    const validTopGenes = await checkValidGenes(topGenes.toString().replaceAll(',', '\n'))
    return validTopGenes

}


export async function getPPIGenes(gene_list: string[]) {
    const API_BASE_URL = process.env.PYTHON_API_BASE
    if (!API_BASE_URL) throw new Error('API_BASE_URL not found')
    const req = await fetch(API_BASE_URL + '/api/get_PPI_genes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'input_genes': gene_list }),
    })
    const responseJSON = await req.json()
    if (req.status === 200){
        const validGenes = await checkValidGenes(responseJSON['ppi_genes'].toString().replaceAll(',', '\n'))
        return validGenes
    } 
    else return []
    }

