import { getRummageneLink, getRummageoLink } from "@/app/analyze/[id]/AnalyzeFunctions";
import { Gene, GeneSet } from "@prisma/client";
import axios from "axios";
import { analysisOptions } from "./ReportLayout";


export async function getAnalysisData(selectedSets: ({
    genes: Gene[];
} & GeneSet)[], analysisOptions: analysisOptions) {
    const analysisResults: { [key: string]: any } = {}
    await Promise.all(selectedSets.map(async (geneset) => {
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
            genesetResults['keaResults'] = {meanRank: meanRank10, topRank: topRank10}
        }
        if (analysisOptions.chea) {
            const cheaResults = await getChEAResults(genes, geneset.name)
            const meanRank10 = cheaResults['Integrated--meanRank'].slice(0, 10)
            const topRank10 = cheaResults['Integrated--topRank'].slice(0, 10)
            genesetResults['cheaResults'] = {meanRank: meanRank10, topRank: topRank10}
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
        analysisResults[geneset.id] = genesetResults
    }))

    return analysisResults
}

async function getEnrichrResults(genes: string[], term: string) {
    const ENRICHR_URL = 'https://maayanlab.cloud/Enrichr/addList'
    const genesString = genes.toString().split(',').join('\n').replaceAll("'", '')
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

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let libResults: { [key: string]: any[] } = {}
    for (let lib of libraries) {
        const response = await fetch(`https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${lib}`)
        if (response.status === 200) {
            const enrichmentResults = await response.json()
            const topResults = enrichmentResults[lib].slice(0, 10)
            libResults[lib] = topResults
        } else {
            await sleep(5)
            const response = await fetch(`https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${lib}`)
            const enrichmentResults = await response.json()
            const topResults = enrichmentResults[lib].slice(0, 10)
            libResults[lib] = topResults
        }
    }
    return {libResults: libResults, shortId: shortId}
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
    const data = await response.text()
    return JSON.parse(data)
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
    const data = await response.json()
    return data

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

    const sigcomLink = "https://maayanlab.cloud/sigcom-lincs#/SignatureSearch/Rank/%s" + persistentId
    return sigcomLink
}


