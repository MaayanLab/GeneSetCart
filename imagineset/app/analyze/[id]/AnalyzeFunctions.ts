'use server'

import axios from "axios"

export async function getEnrichrShortId(genesetName: string, genes: string[]) {
    const ENRICHR_URL = 'https://maayanlab.cloud/Enrichr/addList'
    const genesString = genes.join('\n')
    const { data } = await axios.post(ENRICHR_URL, {
        'list': genesString,
        'description': genesetName
    }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }
    )
    return data.userListId
}


export async function getRummageneLink(genesetName: string, genes: string[]) {
    const RUMMAGENE_URL = 'https://rummagene.com/graphql'
    const json = {
        "operationName": "AddUserGeneSet",
        "variables": { "description": genesetName, "genes": genes },
        "query": "mutation AddUserGeneSet($genes: [String], $description: String = \"\") {\n  addUserGeneSet(input: {genes: $genes, description: $description}) {\n    userGeneSet {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n"
    }
    try {
        const response = await fetch(RUMMAGENE_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(json),
            })

        const responseJSON = await response.json()
        const datasetId = responseJSON["data"]['addUserGeneSet']["userGeneSet"]["id"]
        const link = 'https://rummagene.com/enrich?dataset=' + datasetId
        return link
    } catch {
        await new Promise(r => setTimeout(r, 2000));
        const response = await fetch(RUMMAGENE_URL,
            {
                method: "POST",
                headers: {
                    // "Content-Type": "application/json;charset=UTF-8",
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)"
                },
                body: JSON.stringify(json),
            })

        const responseJSON = await response.json()
        const datasetId = responseJSON["data"]['addUserGeneSet']["userGeneSet"]["id"]
        const link = 'https://rummagene.com/enrich?dataset=' + datasetId
        return link
    }
}

export async function getRummageoLink(genesetName: string, genes: string[]) {
    const RUMMAGEO_URL = 'https://rummageo.com/graphql'
    const json = {
        "operationName": "AddUserGeneSet",
        "variables": { "description": genesetName, "genes": genes },
        "query": "mutation AddUserGeneSet($genes: [String], $description: String = \"\") {\n  addUserGeneSet(input: {genes: $genes, description: $description}) {\n    userGeneSet {\n      id\n      __typename\n    }\n    __typename\n  }\n}\n"
    }
    try {
        const response = await fetch(RUMMAGEO_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(json),
            })

        const responseJSON = await response.json()
        const datasetId = responseJSON["data"]['addUserGeneSet']["userGeneSet"]["id"]
        const link = 'https://rummageo.com/enrich?dataset=' + datasetId + '&_rsc=3hhhm'
        return link
    } catch {
        await new Promise(r => setTimeout(r, 2000));
        const response = await fetch(RUMMAGEO_URL,
            {
                method: "POST",
                headers: {
                    // "Content-Type": "application/json;charset=UTF-8",
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)"
                },
                body: JSON.stringify(json),
            })

        const responseJSON = await response.json()
        const datasetId = responseJSON["data"]['addUserGeneSet']["userGeneSet"]["id"]
        const link = 'https://rummageo.com/enrich?dataset=' + datasetId + '&_rsc=3hhhm'
        return link
    }
}


export async function getSigComLINCSId(genesetName: string, genes: string[]) {
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
    const genesetId = await axios.post(LINCS_USER_INPUT_URL, {
        'meta': {
            "$validator": "/dcic/signature-commons-schema/v6/meta/user_input/user_input.json",
            'description': genesetName,
            'entities': gene_ids,
            'type': "signatures"
        }
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return genesetId.data.id
}

export async function getPlaybookLink(genesetName: string, genes: string[]) {
    const requestBody = {
        data: { gene_set: { type: "Input[Set[Gene]]", value: { set: genes, description: genesetName } } },
        workflow: [
            { id: "input_gene_set", type: "Input[Set[Gene]]", data: { id: "gene_set" } },
        ],
    }
    const req = await fetch('https://playbook-workflow-builder.cloud/api/db/fpl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    const res = await req.json()
    return `https://playbook-workflow-builder.cloud/graph/${res}`
}