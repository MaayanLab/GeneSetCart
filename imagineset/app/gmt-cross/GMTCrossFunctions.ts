'use server'
// import { factorial } from "mathjs"
import pmf from "@stdlib/stats-base-dists-hypergeometric-pmf"
import prisma from '@/lib/prisma';

type EnrichrGeneResult = {
    gene: string,
    count: number
}

export type PairsData = {
    id: number,
    geneset1: string,
    geneset2: string,
    overlappingGenes: string[],
    pvalue: string
    jIndex: string
}


function genesetsIntersect(setCount: number, concatSets: string[]) {
    let countArray: { [key: string]: number } = {}
    const occurrences = concatSets.reduce(function (previousValue, currentvalue) {
        return previousValue[currentvalue] ? ++previousValue[currentvalue] : previousValue[currentvalue] = 1, previousValue
    }, countArray);
    const genes = Object.keys(occurrences).filter((gene) => occurrences[gene] === setCount)
    return genes
}


function jaccard_similarity(set1: string[], set2: string[]) {
    const union = Array.from(new Set([...set1, ...set2]))
    const intersection = set1.filter(function (n) {
        return set2.indexOf(n) !== -1;
    });
    return {
        'overlap': intersection,
        'nOverlap': intersection.length,
        'jIndex': intersection.length / union.length,
        'union': union
    }
}



function formatNumber(number: number) {
    if (number.toFixed(4).toString() === '0.0000') {
        return number.toExponential(2);
    } else {
        return number.toFixed(4)
    }
}


export async function CrossPairs(libName1: string, libName2: string) {
    const response1 = await fetch(`https://maayanlab.cloud/Enrichr/geneSetLibrary?libraryName=${libName1}&mode=json`)
    const response2 = await fetch(`https://maayanlab.cloud/Enrichr/geneSetLibrary?libraryName=${libName2}&mode=json`)
    // result format: 	
    // {
    //   "Data_Acquisition_Method_Most_Popular_Genes": {
    //     "libraryName": "Data_Acquisition_Method_Most_Popular_Genes",
    //     "isFuzzy": false,
    //     "format": "{0} frequently occurs in gene lists from {1}.",
    //     "category": "Misc",
    //     "terms": {
    //       "ChIP-seq": { //geneset name
    //         "LRRC37A3": 1,
    //         "TLE3": 1,
    //         "MED4": 1,
    let lib1Data = await response1.json()
    let lib2Data = await response2.json()
    const lib1Genesets = lib1Data[libName1].terms
    const lib2Genesets = lib2Data[libName2].terms
    let pairsData: PairsData[] = [];
    for (let [i, genesetOuter] of Object.keys(lib1Genesets).entries()) {
        for (let [j, genesetInner] of Object.keys(lib2Genesets).entries()) {
            const geneset1Name = genesetOuter
            const geneset1GenesMap = Object.values(lib1Genesets)[i]
            const geneset1Genes = Object.keys(geneset1GenesMap as Object)
            const geneset2Name = genesetInner
            const geneset2GenesMap = Object.values(lib2Genesets)[j]
            const geneset2Genes = Object.keys(geneset2GenesMap as Object)
            const overlapResults = jaccard_similarity(geneset1Genes, geneset2Genes)
            if (overlapResults.nOverlap > 0 ) {
            const a = overlapResults.nOverlap
            const b = geneset1Genes.length - overlapResults.nOverlap
            const c = geneset2Genes.length - overlapResults.nOverlap
            // approximate number of entities exist, in the case of Human Genes for instance this might be 21000
            const d = 21000 - geneset1Genes.length - geneset2Genes.length + overlapResults.nOverlap
            const pvalue = pmf(a, 21000, (a + b),(a + c))
                pairsData.push({
                    'id': pairsData.length,
                    'geneset1': geneset1Name,
                    'geneset2': geneset2Name,
                    'overlappingGenes': overlapResults.overlap,
                    'pvalue': formatNumber(pvalue),
                    'jIndex': formatNumber(overlapResults.jIndex)
                })
            }
        }
    }
    return pairsData
}

const libMap : {[key: string]: string} = {
    'LINCS L1000 CMAP Chemical Pertubation Consensus Signatures': 'LINCS_L1000_Chem_Pert_Consensus_Sigs',
    'LINCS L1000 CMAP CRISPR Knockout Consensus Signatures': 'LINCS_L1000_CRISPR_KO_Consensus_Sigs',
    'GTEx Tissue Gene Expression Profiles': 'GTEx_Tissues',
    'GTEx Tissue-Specific Aging Signatures': 'GTEx_Aging_Sigs',
    'Metabolomics Gene-Metabolite Associations': 'Metabolomics_Workbench_Metabolites',
    'IDG Drug Targets': 'IDG_Drug_Targets',
    'Glygen Glycosylated Proteins': 'GlyGen_Glycosylated_Proteins',
    'KOMP2 Mouse Phenotypes': 'KOMP2_Mouse_Phenotypes',
    // "HuBMAP_ASCTplusB_augmented_2022": 'HuBMAP Anatomical Structures, Cell Types, and Biomarkers (ASCT+B)',
    'MoTrPAC Rat Endurance Exercise Training': 'MoTrPAC'
}


export async function fetchCrossPairs(lib1: string, lib2: string) {
    console.log(lib1, lib2)
    const rows = await prisma.cFDECrossPair.findMany({
        where: {
            lib_1: libMap[lib1], 
            lib_2: libMap[lib2]
        }
    });
    if (rows.length === 0) {
        const rows = await prisma.cFDECrossPair.findMany({
            where: {
                lib_1: libMap[lib2], 
                lib_2: libMap[lib1]
            }
        })
        return rows
    }
    return rows
}