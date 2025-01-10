import { getL2S2Link, getPFOCRummageLink, getRummageneLink, getRummageoLink } from "@/app/analyze/[id]/AnalyzeFunctions";
import { Gene, GeneSet } from "@prisma/client";
import axios from "axios";
import { analysisOptions, visualizationOptions } from "./ReportLayout";
import { generateGPTSummary } from "./gptSummary";
import { getPlaybookReportLink } from "./playbook";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getAnalysisData(selectedSets: ({
    genes: Gene[];
} & GeneSet)[], analysisOptions: analysisOptions, visualizationOptions: visualizationOptions) {
    const analysisResults: { [key: string]: any } = {}
    for (const geneset of selectedSets) {
        let genesetResults: { [key: string]: any } = {};
        const genes = geneset.isHumanGenes ? geneset.genes.map((gene) => gene.gene_symbol) : geneset.otherSymbols
        if (analysisOptions.enrichr) {
            const enrichr = await getEnrichrResults(genes, geneset.name)
            genesetResults['enrichrResults'] = enrichr.libResults
            genesetResults['enrichrLink'] = enrichr.shortId
        }
        if (analysisOptions.kea) {
            const keaResults = await getKEA3Results(genes, geneset.name)
            const meanRank10 = keaResults['Integrated--meanRank'].slice(0, 10)
            const topRank10 = keaResults['Integrated--topRank'].slice(0, 10)
            genesetResults['keaResults'] = { meanRank: meanRank10, topRank: topRank10 }
        }
        if (analysisOptions.chea) {
            const cheaResults = await getChEAResults(genes, geneset.name)
            const meanRank10 = cheaResults['Integrated--meanRank'].slice(0, 10)
            const topRank10 = cheaResults['Integrated--topRank'].slice(0, 10)
            genesetResults['cheaResults'] = { meanRank: meanRank10, topRank: topRank10 }
        }
        if (analysisOptions.sigcom) {
            const sigcomResults = await getSigComLINCSResults(genes, geneset.name)
            genesetResults['sigcomLink'] = sigcomResults
        }
        if (analysisOptions.rummagene) {
            const rummageneLink = await getRummageneLink(geneset.name, genes)
            genesetResults['rummageneLink'] = rummageneLink
        }
        if (analysisOptions.rummageo) {
            const rummageoLink = await getRummageoLink(geneset.name, genes)
            genesetResults['rummageoLink'] = rummageoLink
        }
        if (analysisOptions.l2s2) {
            const l2s2Link = await getL2S2Link(geneset.name, genes)
            genesetResults['l2s2Link'] = l2s2Link
        }
        if (analysisOptions.pfocr) {
            const pfocrLink = await getPFOCRummageLink(geneset.name, genes)
            genesetResults['pfocrLink'] = pfocrLink
        }
        analysisResults[geneset.id] = genesetResults
    }

    let genesetDict: { [key: string]: string[] } = {}
    selectedSets.forEach((set) => {
        genesetDict[set.name] = set.isHumanGenes ? set.genes.map((gene) => gene.gene_symbol) : set.otherSymbols
    })
    analysisResults['overlappingGenes'] = getGMTOverlap(genesetDict)
    if (analysisResults['overlappingGenes'].length > 0) {
        const gptSummary = await generateGPTSummary(analysisResults['overlappingGenes'])
        analysisResults['gptSummary'] = gptSummary.response
    }
    analysisResults['playbookLink'] = await getPlaybookReportLink(selectedSets, visualizationOptions)
    return analysisResults
}

async function getEnrichrResults(genes: string[], term: string) {
    const ENRICHR_URL = 'https://maayanlab.cloud/Enrichr/addList'
    const genesString = genes.toString().split(',').join('\n').replaceAll("'", '')
    await sleep(1000)
    const { data } = await axios.post(ENRICHR_URL, {
        'list': genesString,
        'description': term
    }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }
    )
    const userListId = data.userListId
    const shortId = data.shortId
    // const libraries = ['WikiPathway_2023_Human', 'GWAS_Catalog_2023', 'GO_Biological_Process_2023', 'MGI_Mammalian_Phenotype_Level_4_2021',]
    const libraries = ['WikiPathway_2023_Human', 'GO_Biological_Process_2023']
    let libResults: { [key: string]: any[] } = {}
    for (let lib of libraries) {
        await sleep(1000)
        const response = await fetch(`https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${lib}`)
        if (response.status === 200) {
            const enrichmentResults = await response.json()
            const topResults = enrichmentResults[lib].slice(0, 10)
            libResults[lib] = topResults
        } else {
            await sleep(5000)
            const response = await fetch(`https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${lib}`)
            const enrichmentResults = await response.json()
            const topResults = enrichmentResults[lib].slice(0, 10)
            libResults[lib] = topResults
        }
        await sleep(1000)
    }
    return { libResults: libResults, shortId: shortId }
}

async function getKEA3Results(genes: string[], term: string) {
    const KEA_URL = 'https://maayanlab.cloud/kea3/api/enrich/'
    const payload = {
        'gene_set': genes,
        'query_name': term
    }
    const response = await fetch(KEA_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    if (response.status === 200) {
        const data = await response.text()
        return JSON.parse(data)
    } else {
        await sleep(5)
        const response = await fetch(KEA_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await response.text()
        return JSON.parse(data)
    }
}

async function getChEAResults(genes: string[], term: string) {
    const CHEA_URL = 'https://maayanlab.cloud/chea3/api/enrich/'
    const payload = {
        'gene_set': genes,
        'query_name': term
    }
    const response = await fetch(CHEA_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    if (response.status === 200) {
        const data = await response.json()
        return data
    } else {
        await sleep(5)
        const response = await fetch(CHEA_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await response.json()
        return data
    }
}

async function getSigComLINCSResults(genes: string[], term: string) {
    const LINCS_FIND_URL = 'https://maayanlab.cloud/sigcom-lincs/metadata-api/entities/find'
    const { data } = await axios.post(LINCS_FIND_URL, {
        'filter': {
            'where': {
                'or':
                    [{
                        'meta.symbol': {
                            'inq': genes
                        }
                    },
                    {
                        'meta.ensemblid': {
                            'inq': genes
                        }
                    }],

            }
        }

    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    let gene_ids = data.map((gene_info: any) => gene_info.id)
    // use gene entities to get uuid for gene set
    const LINCS_USER_INPUT_URL = 'https://maayanlab.cloud/sigcom-lincs/metadata-api/user_input'
    const response = await axios.post(LINCS_USER_INPUT_URL, {
        'meta': {
            "$validator": "/dcic/signature-commons-schema/v6/meta/user_input/user_input.json",
            'description': term,
            'entities': gene_ids,
            'type': "signatures"
        }
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const persistentId = response.data.id

    const sigcomLink = "https://maayanlab.cloud/sigcom-lincs#/SignatureSearch/Set/" + persistentId
    return sigcomLink
}

export type overlapArray = {
    geneset1: string,
    geneset2: string,
    overlapGenes: string[]
}

function getGMTOverlap(genesetsObject: { [key: string]: string[] }) {
    let overlapAll: overlapArray[] = []
    let completedPairs : string[] = []
    const genesetNames = Object.keys(genesetsObject)
    for (let geneset1 of genesetNames) {
        for (let geneset2 of genesetNames) {
            if (geneset1 !== geneset2) {
                if (!(completedPairs.includes([geneset1, geneset2].toString()) || completedPairs.includes([geneset2, geneset1].toString()))){
                    const genes1 = genesetsObject[geneset1]
                    const genes2 = genesetsObject[geneset2]
                    const overlap = genes1.filter(x => genes2.includes(x))
                    if (overlap.length <= 30) {
                        overlapAll.push({ geneset1: geneset1, geneset2: geneset2, overlapGenes: overlap })
                        completedPairs.push([geneset1, geneset2].toString())
                    }
                }
            }
        }
    }
    return overlapAll
}

export function getNumbering(visualizationOptions: visualizationOptions, analysisOptions: analysisOptions, disabledOptions: visualizationOptions, selectedSetsCount: number) {
    const figureLegends : {[key: string]:  any }= { 'venn': 0, 'supervenn': 0, 'upset': 0, 'heatmap': 0, 'umap': 0, 'enrichr': [], 'kea': [], 'chea': [] }
    const analysisLegends = {'enrichr': 0, 'kea': 0, 'chea': 0, 'sigcom': 0, 'rummagene': 0, 'rummageo': 0, 'l2s2': 0, 'pfocr': 0, 'playbook': 0 }
    let current = 1
    let analysisCurrent = 1
    if (visualizationOptions.heatmap && !disabledOptions.heatmap) {
        figureLegends.heatmap = current
        current += 1
    }
    if (visualizationOptions.venn && !disabledOptions.venn) {
        figureLegends.venn = current
        current += 1
    }
    if (visualizationOptions.supervenn && !disabledOptions.supervenn) {
        figureLegends.supervenn = current
        current += 1
    }
    if (visualizationOptions.upset && !disabledOptions.upset) {
        figureLegends.upset = current
        current += 1
    }

    if (visualizationOptions.umap && !disabledOptions.umap) {
        figureLegends.umap = current
        current += 1
    }
    for (let i = 0; i < selectedSetsCount; i++) {
        if (analysisOptions.enrichr) {
            figureLegends.enrichr.push(current)
            current += 1
            if (i === 0 ){
                analysisLegends.enrichr = analysisCurrent
                analysisCurrent += 1
            }
        }
        if (analysisOptions.kea) {
            figureLegends.kea.push(current)
            current += 1
            if (i === 0 ){
            analysisLegends.kea = analysisCurrent
            analysisCurrent += 1
            }
        }
        if (analysisOptions.chea) {
            figureLegends.chea.push(current)
            current += 1
            if (i === 0 ){
            analysisLegends.chea = analysisCurrent
            analysisCurrent += 1
            }
        }
        if (analysisOptions.sigcom && i === 0) {
            analysisLegends.sigcom = analysisCurrent
            analysisCurrent += 1
        }
        if (analysisOptions.rummagene && i === 0) {
            analysisLegends.rummagene = analysisCurrent
            analysisCurrent += 1
        }
        if (analysisOptions.rummageo && i === 0) {
            analysisLegends.rummageo = analysisCurrent
            analysisCurrent += 1
        }
        if (analysisOptions.l2s2 && i === 0) {
            analysisLegends.l2s2 = analysisCurrent
            analysisCurrent += 1
        }
        if (analysisOptions.pfocr && i === 0) {
            analysisLegends.pfocr = analysisCurrent
            analysisCurrent += 1
        }
        if (analysisOptions.playbook && i === 0) {
            analysisLegends.playbook = analysisCurrent
            analysisCurrent += 1
        }
    }
    return {figureLegends: figureLegends, analysisLegends: analysisLegends}
}
