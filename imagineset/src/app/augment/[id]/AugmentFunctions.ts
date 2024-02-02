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

export async function getPPIGenes(gene_list: string[]) {
const payload = {
    'geneset' : gene_list, 
             'biogrid': true,
             'bioplex': true, 
             'string': true,
             'iid': true, 
             'ht' : true,
             'ci' : 0.85,
             'pred' : true,
             'ortho' : true,
             }

const response = await fetch('https://g2nkg.dev.maayanlab.cloud/api/knowledge_graph/ppi_kg', {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
});

let ppiGenes : string[] = []
if (response.status === 200) {
    const responseJson = await response.json()
    // loop through edges for PPI network
    
    responseJson.forEach((networkItem: { data: { kind: string; properties: { target_label: any; source_label: any; }; }; }) => {
        if  (networkItem.data.kind === 'Relation') {
            const possibleGene1= networkItem.data.properties.target_label
            const possibleGene2= networkItem.data.properties.source_label
            console.log(possibleGene1)
            if ((!gene_list.includes(possibleGene1)) && (!ppiGenes.includes(possibleGene1))){
                ppiGenes.push(possibleGene1)
            }
            if ((!gene_list.includes(possibleGene2)) && (!ppiGenes.includes(possibleGene2))){
                ppiGenes.push(possibleGene2)
            }
        } 
    })
}
// TODO: check valid genes before returning
return ppiGenes
}