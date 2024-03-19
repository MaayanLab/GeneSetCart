import { Gene, GeneSet } from "@prisma/client";
import React from "react";
import { DataPoint, Scatterplot } from "./Scatterplot";
import { parse } from "path";
import { height, width } from "@mui/system";


export function UMAP({ selectedSets, setOverlap }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined;
    setOverlap: React.Dispatch<React.SetStateAction<string[]>>;
}) {
    let genesetDict: { [key: string]: string[] } = {}
    const genesetGenes = selectedSets?.forEach((geneset) => {
        const genes = geneset.genes.map((gene) => gene.gene_symbol)
        const genesetName = geneset.name
        genesetDict[genesetName] = genes
    })
    const [dataMapped, setDataMapped] = React.useState<DataPoint[]>([])
    if (!genesetDict || !selectedSets) return <></>
    else {
        React.useEffect(() => {
            fetch('http://0.0.0.0:8000/api/getUMAP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'geneset_genes': genesetDict }),
            }).then((response) => response.json()).then((parsedUMAP) => {
                const dataMapped = parsedUMAP.map((datapoint: string[]) => {
                    return ({
                        x: datapoint[0],
                        y: datapoint[1],
                        group: datapoint[2],
                        subGroup: datapoint[3]
                    })
                });
                setDataMapped(dataMapped)
            }).catch((err) => console.log(err))
        }, [])

        return  <Scatterplot width={500} height={500} data={dataMapped} />
    }
}

