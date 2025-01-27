"use server"

import { overlapArray } from "./fetchData"
import { getEnrichmentTerms } from "../../gmt-cross/[id]/GMTCrossFunctions"

export async function generateGPTSummary(overlapInfo: overlapArray[]) {
    const input = `
    Out of a selection of gene sets, these are the gene set pairs that have less
    than 10 overlapping genes between them. Hypothesize a reason 
    for the overlap between each these gene set pairs

    The gene set pairs with their overlaps are: 
    ${overlapInfo.map((overlap) => {
        return `
        gene set 1: ${overlap.geneset1},
        gene set 2: ${overlap.geneset2},
        overlapping genes: ${overlap.overlapGenes}
    `
}
    )}
    If there are genes that appear in numerous pairs, also hypothesize 
    why these genes may be relevant in the context of all sets.
    Do not include 'Hypothesis: ' at the beginning of your response and 
    limit your response to about 12 sentences.
    `
    try {
        const openaiKey = process.env.OPENAI_API_KEY
        if (!openaiKey) throw new Error('no OPENAI_API_KEY')
        const tagLine = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { "role": "system", "content": "You are a biologist who attempts to create a hypothesis about why two gene sets, which are lists of genes, may have a high overlap" },
                    { "role": "user", "content": input }
                ],
                temperature: 0
            })
        })
        const tagLineParsed = await tagLine.json()
        const hypothesis: string = tagLineParsed.choices[0].message.content
        return {
            response: hypothesis,
            status: 200
        }
    } catch {
        return {
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1
        }
    }
}


export async function createGPTAbstract(analysisDescriptions: string) {
    const input = `Based on the following descriptions of the gene sets analyzed, selected visualizations,
    and the resources used to analyze them generate a paragraph abstract describing the analysis briefly. 
    You should strictly adhere to the provided descriptions and not assume any information. Adhere to the resource names capitalization and format:
    ${analysisDescriptions}
    `
    try {
        const openaiKey = process.env.OPENAI_API_KEY
        if (!openaiKey) throw new Error('no OPENAI_API_KEY')
        const tagLine = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { "role": "system", "content": "You are a biologist who attempts to create a hypothesis about why two gene sets, which are lists of genes, may have a high overlap" },
                    { "role": "user", "content": input }
                ],
                temperature: 0
            })
        })
        const tagLineParsed = await tagLine.json()
        const abstract: string = tagLineParsed.choices[0].message.content
        return {
            response: abstract,
            status: 200
        }
    } catch {
        return {
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1
        }
    }
}

export async function generateUserSetsHypothesis(geneset1: string, geneset2: string, overlap: string[]) {
    if (overlap.length === 0) return {
        response: {hypothesis: "The selected gene sets do not overlap.", geneset1: geneset1, geneset2: geneset2, enrichedTerms: [], topEnrichmentResults: null},
        status: 200
    }
    const enrichedResults = await getEnrichmentTerms(overlap)
    const enrichedTerms = enrichedResults.enrichedTerms
    const topEnrichmentResults = enrichedResults.topEnrichmentResults

    const input = `
    There are two gene sets that highly overlap. Performing enrichment 
    analysis on the overlapping genes shows that many of them are related to 
    the following biological pathways: ${enrichedTerms.toString()}. 
     Hypothesize why a high overlap between the gene sets exists
    based on specified abstracts of each gene set that explains 
    how each gene set was created, the overlapping genes between 
    both gene sets, and the biological pathways that the overlapping 
    genes are related to based on the gene set enrichment analysis results.
    Make sure to incorporate the enrichment analysis results in 
    your response in a meaningful way. For each enrichment term 
    that appears in your response, the term should appear in the 
    exact form it was given to you (do not exclude any words or 
    characters from a term. For example, Complement And Coagulation 
    Cascades WP558 should appear as Complement And Coagulation 
    Cascades WP558, not Complement And Coagulation Cascades).
    Set names: ${geneset1}, ${geneset2}
    The overlapping genes are ${overlap.toString().replaceAll("'", '')}
    Do not include 'Hypothesis: ' at the beginning of your response and please
    mesh the enrichment analysis results seamlessly into the explanation in a 
    paragraph like format. Limit your response to about 12 sentences.
    `
    try {
        const openaiKey = process.env.OPENAI_API_KEY
        if (!openaiKey) throw new Error('no OPENAI_API_KEY')
        const tagLine = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { "role": "system", "content": "You are a biologist who attempts to create a hypothesis about why two gene sets, which are lists of genes, may have a high overlap" },
                    { "role": "user", "content": input }
                ],
                temperature: 0
            })
        })
        const tagLineParsed = await tagLine.json()
        const hypothesis: string = tagLineParsed.choices[0].message.content
        return {
            response: {hypothesis: hypothesis, geneset1: geneset1, geneset2: geneset2, enrichedTerms: enrichedTerms, topEnrichmentResults: topEnrichmentResults},
            status: 200
        }
    } catch {
        return {
            response: {hypothesis: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes", eneset1: geneset1, geneset2: geneset2, enrichedTerms: [], topEnrichmentResults: null},
            status: 1
        }
    }
}