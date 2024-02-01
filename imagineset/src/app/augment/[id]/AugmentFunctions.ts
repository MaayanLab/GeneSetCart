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
    const topAssociation = Object.keys(associationData).map((gene) => ({'gene': gene, 'simScore': associationData[gene].simScore}))
    const topGenes= topAssociation.sort(function(a, b) { 
        return a.simScore - b.simScore;
    }).map((geneInfo) => geneInfo.gene)
    const validTopGenes = await checkValidGenes(topGenes.toString().replaceAll(',', '\n'))
    return validTopGenes

}



export async function getCoExpressionGenes(gene_list: string[]) {

}

export async function getCoMentionGenes(gene_list: string[]) {

}

// def geneshot_pred_genes(augment_with, gene_list):
//     GENESHOT_URL = 'https://maayanlab.cloud/geneshot/api/associate'
//     payload = {
//     "gene_list": gene_list, 
//     "similarity": augment_with
//     }
//     response = requests.post(GENESHOT_URL, json=payload)

//     data = json.loads(response.text)
//     association_data = data['association']
//     top_associated = []
//     for gene in list(association_data.keys()): 
//         top_associated.append({'gene': gene, 'simScore': association_data[gene]['simScore']})
//     sorted_list = sorted(top_associated, key=lambda x: x['simScore'], reverse=True)  
//     final_list = []
//     for gene_info in sorted_list:
//         final_list.append(gene_info['gene'])  
//     for gene in gene_list:
//         if gene in final_list:
//             final_list.remove(gene)    
//     return final_list