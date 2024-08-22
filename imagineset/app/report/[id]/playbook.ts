import { Gene, GeneSet } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { analysisOptions, visualizationOptions } from "./ReportLayout";


export async function getPlaybookReportLink(selectedSets: ({
    genes: Gene[];
} & GeneSet)[],
    visualizationOptions: visualizationOptions,
    // disabledOptions: visualizationOptions,
    // analysisOptions: analysisOptions
) {
    const ENDPOINT = 'https://playbook-workflow-builder.cloud'
    let dataInfo: { [key: string]: JsonObject } = {}
    const genesetInputWorkflow = selectedSets.map((set, i) => {
        const setData = {
            "type": "Input[Set[Gene]]",
            "value": {
                "description": set.name,
                "set": set.isHumanGenes ? set.genes.map((gene) => gene.gene_symbol) : set.otherSymbols
            }
        }
        dataInfo[set.id.toString()] = setData
        const workflowInfo = {
            "id": `gene-set-input-${i}`,
            "type": "Input[Set[Gene]]",
            "data": {
                "id": set.id
            }
        }
        return workflowInfo

    })

    const { gmtDataFieldObject, gmtWorkflowFieldObject } = generateGMTs(selectedSets)

    dataInfo['gmt-1-data-id'] = gmtDataFieldObject
    // currently running no analyses options due to Playbook display (uncomment the following code block to run for all gene sets)
    let enrichrWorkflow: JsonObject[] = [];
    let cheaWorkflow: JsonObject[] = [];
    let keaWorkflow: JsonObject[] = [];
    let sigComWorkflow: JsonObject[] = [];
    // if (analysisOptions.enrichr) {
    //     enrichrWorkflow = generateEnrichrWorkflow(selectedSets)
    // }
    // if (analysisOptions.chea) {
    //     cheaWorkflow = generateCheaWorkflow(selectedSets)
    // }
    // if (analysisOptions.kea) {
    //     keaWorkflow = generateKeaWorkflow(selectedSets)
    // }
    // if (analysisOptions.sigcom) {
    //     sigComWorkflow = generateSigComWorkflow(selectedSets)
    // }
    const visualizations = getVisualizationsJSON(visualizationOptions)
    const totalWorkflows = [...genesetInputWorkflow, ...enrichrWorkflow, ...cheaWorkflow, ...keaWorkflow, ...sigComWorkflow, ...gmtWorkflowFieldObject, ...visualizations]
    const json = {
        "data": dataInfo,
        "workflow": totalWorkflows
    }
    const response = await fetch(ENDPOINT + '/api/db/fpl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
    })

    const playbookId = await response.json()
    return ENDPOINT + '/graph/' + playbookId
}


function generateEnrichrWorkflow(selectedSets: ({
    genes: Gene[];
} & GeneSet)[]) {
    return selectedSets.map((set, i) => {
        const workflowInfo = {
            "id": `enrichr-${i}`,
            "type": "EnrichrGenesetSearch",
            "inputs": {
                "geneset": {
                    "id": `gene-set-input-${i}`
                }
            }
        }
        return workflowInfo
    })
}

function generateCheaWorkflow(selectedSets: ({
    genes: Gene[];
} & GeneSet)[]) {
    return selectedSets.map((set, i) => {
        const workflowInfo = {
            "id": `chea-${i}`,
            "type": "ChEA3TFEnrichmentAnalysis",
            "inputs": {
                "gene_set": {
                    "id": `gene-set-input-${i}`
                }
            }
        }
        return workflowInfo

    })
}


function generateKeaWorkflow(selectedSets: ({
    genes: Gene[];
} & GeneSet)[]) {
    return selectedSets.map((set, i) => {
        const workflowInfo = {
            "id": `chea-${i}`,
            "type": "KEA3KinaseEnrichmentAnalysis",
            "inputs": {
                "gene_set": {
                    "id": `gene-set-input-${i}`
                }
            }
        }
        return workflowInfo
    })
}


function generateSigComWorkflow(selectedSets: ({
    genes: Gene[];
} & GeneSet)[]) {
    return selectedSets.map((set, i) => {
        const workflowInfo = {
            "id": `chea-${i}`,
            "type": "SigComLINCSGeneSetSearch",
            "inputs": {
                "genes": {
                    "id": `gene-set-input-${i}`
                }
            }
        }
        return workflowInfo
    })
}

function generateGMTs(selectedSets: ({
    genes: Gene[];
} & GeneSet)[]) {
    let inputs: JsonObject = {}
    let termsJSON: JsonObject = {}
    let descriptionsJSON: JsonObject = {}
    selectedSets.forEach((set, i) => {
        inputs[`genesets:${i}`] = {
            id: `gene-set-input-${i}`
        }
        termsJSON[i] = set.name
        descriptionsJSON[i] = set.description
    })
    const dataFieldObject = {
        type: 'GenesetsToGMT',
        value: {
            terms: termsJSON,
            descriptions: descriptionsJSON

        }
    }
    const workflowFieldObject = {
        id: 'gmt-1',
        type: 'GenesetsToGMT',
        inputs: inputs,
        data: {
            id: 'gmt-1-data-id'
        }
    }
    return { gmtDataFieldObject: dataFieldObject, gmtWorkflowFieldObject: [workflowFieldObject] }
}

function getVisualizationsJSON(visualizationOptions: visualizationOptions,) {
    let visualizationWorkflows: JsonObject[] = []
    if (visualizationOptions.supervenn) {
        visualizationWorkflows.push({
            id: 'supervenn-plot-id',
            type: 'SupervennFromGMT',
            inputs: {
                gmt: {
                    id: 'gmt-1'
                }
            }

        })
    }
    if (visualizationOptions.upset) {
        visualizationWorkflows.push({
            id: 'upset-plot-id',
            type: 'UpSetFrom[GMT]',
            inputs: {
                matrix: {
                    id: 'gmt-1'
                }
            }

        })
    }
    if (visualizationOptions.umap) {
        visualizationWorkflows.push({
            id: 'umap-plot-id',
            type: 'UMAPFrom[GMT]',
            inputs: {
                matrix: {
                    id: 'gmt-1'
                }
            }

        })
    }
    return visualizationWorkflows
}



