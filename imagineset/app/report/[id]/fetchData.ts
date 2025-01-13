import { getL2S2Link, getPFOCRummageLink, getRummageneLink, getRummageoLink } from "@/app/analyze/[id]/AnalyzeFunctions";
import { Gene, GeneSet } from "@prisma/client";
import axios from "axios";
import qs from 'qs'; 
import { cacheResult, getCachedResult } from "./cachedResults";
import { analysisOptions, visualizationOptions } from "./ReportLayout";
import { generateGPTSummary, createGPTAbstract } from "./gptSummary";
import { getPlaybookReportLink } from "./playbook";
import { getBackgroundGenes } from "@/components/header/Header";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getAnalysisTypeDescription = (analysisType: string): string => {
    switch (analysisType) {
      case "enrichrResults":
        return "A resource that contains numerous annotated gene set libraries used for enrichment analysis of the provided sets";
      case "keaResults":
        return (`KEA3 (Kinase Enrichment Analysis 3)  infers upstream kinases whose putative substrates are overrepresented in a user-inputted list of proteins or differentially phosphorylated proteins.`)
      case "cheaResults":
        return (`The ChEA3 (ChIP-X Enrichment Analysis 3) predicts transcription factors (TFs) associated with user-input sets of genes. Discrete query gene sets are compared to ChEA3 libraries of \TF target gene sets assembled from multiple orthogonal 'omics' datasets.`)
      case "sigcomLink":
        return (`SigCom LINCS is a web-basedc search engine that serves over 
                1.5 million gene expression signatures processed, analyzed, and visualized 
                from LINCS, GTEx, and GEO. SigCom LINCS
                provides ranked compounds and other perturbations
                that maximally up- or down-regulate the collective
                expression of the genes in the set`)
      case "rummageneLink":
        return (`Rummagene is an enrichment
                analysis tool that can be used to query hundreds of
                thousands of gene sets extracted from supporting
                tables of PubMed Central articles`)
      case "rummageoLink":
        return (`RummaGEO is a search engine
                for finding matching gene sets from a database that
                contains hundreds of thousands gene sets extracted
                automatically from NCBI&apos;s GEO repository`)
      case "l2s2Link":
        return (`L2S2 is a search engine
                for finding matching gene sets from a database that
                contains over a million gene sets measuring response to 
                pre-clinical compounds, drugs, and CRISPR KOs`)
      case "pfocrLink":
        return (`PFOCRummage is a search engine
                for finding matching gene sets from a database that
                contains over 50,000 gene sets extracted from the figures of PMC articles.`)
      default: 
        return "";
    }
  }

async function serializeInputs(
    selectedSets: ({ genes: Gene[] } & GeneSet)[],
    analysisOptions: analysisOptions,
    visualizationOptions: visualizationOptions
) {
    // Helper function to sort keys in an object
    const sortObject = (obj: any): any => {
        if (Array.isArray(obj)) {
            return obj.map(sortObject);
        } else if (obj && typeof obj === "object") {
            return Object.keys(obj)
                .sort()
                .reduce((acc, key) => {
                    acc[key] = sortObject(obj[key]);
                    return acc;
                }, {} as any);
        }
        return obj;
    };

    // Sort and stringify inputs
    const sortedSelectedSets = sortObject(selectedSets);
    const sortedAnalysisOptions = sortObject(analysisOptions);
    const sortedVisualizationOptions = sortObject(visualizationOptions);

    return JSON.stringify({
        selectedSets: sortedSelectedSets,
        analysisOptions: sortedAnalysisOptions,
        visualizationOptions: sortedVisualizationOptions,
    });
}

export async function computeStringHash(s: string) {
    
    let hash = 2166136261; // FNV offset basis
    for (let i = 0; i < s.length; i++) {
      hash ^= s.charCodeAt(i);
      hash = (hash * 16777619) >>> 0; // FNV prime
    }
    
    return hash.toString(16); // Return as a hexadecimal string
}


export async function getReportById(inputHash: string) {
    const existingReport = await getCachedResult(inputHash)
    return JSON.parse(existingReport?.analysisData?.toString() || '{}')
}

export async function getAnalysisData(selectedSets: ({
    genes: Gene[];
} & GeneSet)[], analysisOptions: analysisOptions, visualizationOptions: visualizationOptions, disabledOptions: visualizationOptions) {
    const serializedInput = await serializeInputs(selectedSets, analysisOptions, visualizationOptions)
    const inputHash = await computeStringHash(serializedInput)

    const existingReport = await getCachedResult(inputHash)
    
    if (existingReport) {
        return {id: inputHash, results: JSON.parse(existingReport.analysisData?.toString() || '{}')}
    }

    const analysisResults: { [key: string]: any } = {}
    for (const geneset of selectedSets) {
        let genesetResults: { [key: string]: any } = {};
        const genes = geneset.isHumanGenes ? geneset.genes.map((gene) => gene.gene_symbol) : geneset.otherSymbols
        if (analysisOptions.enrichr) {
            const enrichr = await getEnrichrResults(genes, geneset.name, geneset.background)
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
    
    var abstractPrompt = `Selected genesets: ${selectedSets.map((set) => set.name).join(', ')}`
    abstractPrompt += '\n Visualization options:'
    Object.keys(visualizationOptions).map((key) => {
        if (visualizationOptions[key] == true && !disabledOptions[key]) {
            abstractPrompt += `${key},`
        }
    })
    console.log(analysisOptions)
    abstractPrompt += '\n Analysis resources:'
    Object.keys(analysisOptions).map((key) => {
        if (analysisOptions[key]) {
            abstractPrompt += `\n${key}: ${getAnalysisTypeDescription(key)}`
        }
    })

    const abstract = await createGPTAbstract(abstractPrompt)
    analysisResults['abstract'] = abstract.response

    analysisResults['playbookLink'] = await getPlaybookReportLink(selectedSets, visualizationOptions)

    const added = await cacheResult(inputHash, {...analysisResults, 'analysisOptions': analysisOptions, 'visualizationOptions': visualizationOptions})

    return {id: inputHash, results: analysisResults}
}

async function getEnrichrResults(genes: string[], term: string, background: string | null) {
    const SPEEDRICHR_URL = "https://maayanlab.cloud/speedrichr";
    var backgroundGenes: string[] = []
    var backgroundId: string = ''
    if (background) {
        backgroundGenes = await getBackgroundGenes(background)

        if (backgroundGenes.length > 0) {
            const backgroundString = backgroundGenes.join('\n')
            const { data } = await axios.post(
                `${SPEEDRICHR_URL}/api/addbackground`,
                qs.stringify({ background: backgroundString }), // Form-encode the data
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } // Set appropriate headers
            );
            backgroundId = data.backgroundid
            await sleep(1000)
        }
    }

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
        const response = await fetch(`https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${lib}${backgroundId !== '' ? `&backgroundId=${backgroundId}` : ''}`)
        if (response.status === 200) {
            const enrichmentResults = await response.json()
            const topResults = enrichmentResults[lib].slice(0, 10)
            libResults[lib] = topResults
        } else {
            await sleep(5000)
            const response = await fetch(`https://maayanlab.cloud/Enrichr/enrich?userListId=${userListId}&backgroundType=${lib}${backgroundId !== '' ? `&backgroundId=${backgroundId}` : ''}`)
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
    geneset1N: number,
    geneset2N: number,
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
                        overlapAll.push({ geneset1: geneset1, geneset2: geneset2, geneset1N: genes1.length, geneset2N: genes2.length, overlapGenes: overlap })
                        completedPairs.push([geneset1, geneset2].toString())
                    }
                }
            }
        }
    }
    return overlapAll
}
export function getNumbering(
    visualizationOptions: visualizationOptions,
    analysisOptions: analysisOptions,
    disabledOptions: visualizationOptions,
    selectedSetsCount: number,
    byGeneset: boolean
  ) {
    const figureLegends: { [key: string]: any } = {
      venn: 0,
      supervenn: 0,
      upset: 0,
      heatmap: 0,
      umap: 0,
      enrichr: [],
      kea: [],
      chea: [],
    };
  
    const analysisLegends: { [key: string]: number } = {
      enrichr: 0,
      kea: 0,
      chea: 0,
      sigcom: 0,
      rummagene: 0,
      rummageo: 0,
      l2s2: 0,
      pfocr: 0,
      playbook: 0,
    };
  
    let current = 1;
    let analysisCurrent = 1;
  
    // Handle visualization options
    const visualizations = ["heatmap", "venn", "supervenn", "upset", "umap"];
    for (const vis of visualizations) {
      if (visualizationOptions[vis] && !disabledOptions[vis]) {
        figureLegends[vis] = current;
        current += 1;
      }
    }
  
    if (byGeneset) {
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
        }
    } else {
      // Numbering by analysis type
      if (analysisOptions.enrichr) {
        analysisLegends.enrichr = analysisCurrent;
        analysisCurrent += 1;
        for (let i = 0; i < selectedSetsCount; i++) {
          figureLegends.enrichr.push(current);
          current += 1;
        }
      }
      if (analysisOptions.kea) {
        analysisLegends.kea = analysisCurrent;
        analysisCurrent += 1;
        for (let i = 0; i < selectedSetsCount; i++) {
          figureLegends.kea.push(current);
          current += 1;
        }
      }
      if (analysisOptions.chea) {
        analysisLegends.chea = analysisCurrent;
        analysisCurrent += 1;
        for (let i = 0; i < selectedSetsCount; i++) {
          figureLegends.chea.push(current);
          current += 1;
        }
      }
    }
  
    // Handle single-instance analysis options (applies only to the first set in `byGeneset`)
    const singleAnalysisOptions = [
      "sigcom",
      "rummagene",
      "rummageo",
      "l2s2",
      "pfocr",
      "playbook",
    ];
    for (const option of singleAnalysisOptions) {
      if (analysisOptions[option]) {
        analysisLegends[option] = analysisCurrent;
        analysisCurrent += 1;
      }
    }
  
    return { figureLegends, analysisLegends };
  }
  
  