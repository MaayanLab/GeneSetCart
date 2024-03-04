'use server'
export async function generateHypothesis(overlapGeneSet: string[], abstract1: string, abstract2: string) {
    const input = `
    There are two gene sets that highly overlap. Based on the abstracts of each gene set that explains how each gene set 
    was created and the overlapping genes between both gene sets, hypothesize why a high overlap between the gene sets exists.
    Abstract for gene set 1: ${abstract1}
    Abstract for gene set 2: ${abstract2}
    The overlapping genes are ${overlapGeneSet.toString()}
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
        console.log(hypothesis)
            return hypothesis

    } catch {
        return {
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1,
            input: undefined,
            output: undefined
        }
    }
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
        console.log(abstracts)
            return abstracts

    } catch {
        return {
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1,
            input: undefined,
            output: undefined
        }
    }
}

export async function generateHypothesis2(term1: string, term2: string, overlapGeneSet: string[], abstract1: string, abstract2: string) {
    const abstracts = await getSpecifiedAbstracts(term1, term2, abstract1, abstract2)
    const input = `
    There are two gene sets that highly overlap. Based on specified abstracts of each gene set that explains how each gene set 
    was created and the overlapping genes between both gene sets, hypothesize why a high overlap between the gene sets exists.
    Specified Abstracts for gene sets: ${abstracts}
    The overlapping genes are ${overlapGeneSet.toString()}
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
            return hypothesis

    } catch {
        return {
            response: "The OpenAI endpoint is currently overloaded. Please try again in a few minutes",
            status: 1,
            input: undefined,
            output: undefined
        }
    }
}