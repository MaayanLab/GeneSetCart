// import { UMAP } from 'umap-js';

import { Gene, GeneSet } from "@prisma/client";


// const umap = new UMAP();

export function UMAP({ selectedSets, setOverlap }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined;
    setOverlap: React.Dispatch<React.SetStateAction<string[]>>;
}) {
    const genesetGenes = selectedSets?.map((geneset) => geneset.genes.map((gene) => gene.gene_symbol))
    if (!genesetGenes) return <></>
    else {
        fetch('http://127.0.0.1:5000/api/getUMAP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'geneset_genes': genesetGenes }),
        }).then((response) => console.log(response))
    }
}