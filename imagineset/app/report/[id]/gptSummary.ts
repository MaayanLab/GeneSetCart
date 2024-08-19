"use server"

import { overlapArray } from "./fetchData"

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