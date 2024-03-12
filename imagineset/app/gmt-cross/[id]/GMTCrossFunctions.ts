'use server'
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import axios from 'axios';

export type PairsData = {
    id: number,
    geneset1: string,
    geneset2: string,
    overlappingGenes: string[],
    pvalue: string
    jIndex: string
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


async function getEnrichmentTerms(overlapGenes: string[]) {
    const ENRICHR_URL = 'https://maayanlab.cloud/Enrichr/addList'
    const genesString = overlapGenes.join('\n')
    const { data } = await axios.post(ENRICHR_URL, {
        'list': genesString,
        'description': ''
    }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }
    )
    const userListId = data.userListId
    const enrichmentResults = await axios.get(`https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=WikiPathway%202023%20Human`)
    console.log(enrichmentResults)
    
}

export async function getSpecifiedAbstracts(term1: string, term2: string, abstract1: string, abstract2: string) {
    const input = `
    There are two gene sets that highly overlap. Use each term provided for each gene set template to create a 
    specified abstract for that gene set based on its given abstract template. 
    Term for gene set 1: ${term1}
    Term for gene set 1: ${term2}
    Abstract template for gene set 1: ${abstract1}
    Abstract template for gene set 2: ${abstract2}
    The response should only include the specified abstracts for both gene sets
    `
    try {
        const cachedAbstracts = cache.get( term1+ term2 + abstract1+ abstract2 );
        if ( cachedAbstracts === undefined ){
            const openaiKey = process.env.OPENAI_API_KEY
            if (!openaiKey) throw new Error('no OPENAI_API_KEY')
            const tagLine = await fetch(`https://api.openai.com/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { "role": "system", "content": "You are a biologist who attempts parse a term and create a specified abstract based on an abstract template" },
                        { "role": "user", "content": input }
                    ],
                    // max_tokens: 20,
                    temperature: 0
                })
            })
            const tagLineParsed = await tagLine.json()
            const abstracts: string = tagLineParsed.choices[0].message.content
            const success = cache.set( term1+ term2 + abstract1+ abstract2, abstracts, 10000 )
            return abstracts
        } else {
            return cachedAbstracts ? cachedAbstracts : ''
        }


    } catch {
        return {
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1,
            input: undefined,
            output: undefined
        }
    }
}

export async function generateHypothesis(row: any ) {
    const abstract1 = await prisma.libAbstracts.findFirst({
        where: {
            lib: row.lib_1
        },
        select: {
            abstract: true
        }
    })

    const abstract2 = await prisma.libAbstracts.findFirst({
        where: {
            lib: row.lib_2
        }, 
        select: {
            abstract: true
        }
    })

    const term1= row.geneset_1
    const term2 = row.geneset_2
    const overlapGeneSet = row.overlap
    if ((abstract1 === null) || (abstract2 === null) ) throw new Error('templates not found')
    const abstracts = await getSpecifiedAbstracts(term1, term2, abstract1.abstract, abstract2.abstract)
    const input = `
    There are two gene sets that highly overlap. Based on specified abstracts of each gene set that explains how each gene set 
    was created and the overlapping genes between both gene sets, hypothesize why a high overlap between the gene sets exists.
    Specified Abstracts for gene sets: ${abstracts}
    The overlapping genes are ${overlapGeneSet.toString()}
    Do not include 'Hypothesis: ' at the beginning of your response
    `
    try {
        const cachedHypothesis = cache.get( term1+term2 );
        if ( cachedHypothesis === undefined ){
        const openaiKey = process.env.OPENAI_API_KEY
        if (!openaiKey) throw new Error('no OPENAI_API_KEY')
        const tagLine = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { "role": "system", "content": "You are a biologist who attempts to create a hypothesis about why two gene sets, which are lists of genes, may have a high overlap" },
                    { "role": "user", "content": input }
                ],
                // max_tokens: 20,
                temperature: 0
            })
        })
        const tagLineParsed = await tagLine.json()
        const hypothesis: string = tagLineParsed.choices[0].message.content
        const success = cache.set(term1+term2, hypothesis, 10000 )
        return hypothesis
    } else {
        return cachedHypothesis ? cachedHypothesis : ''
    }
    } catch {
        return {
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1,
            input: undefined,
            output: undefined
        }
    }
}