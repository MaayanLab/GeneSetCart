import { Gene, GeneSet } from "@prisma/client";
import React from "react";
import { DataPoint, Scatterplot } from "./Scatterplot";
import CircularIndeterminate from "@/components/misc/Loading";


export function UMAP({ selectedSets, setOverlap }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined;
    setOverlap: React.Dispatch<React.SetStateAction<string[]>>;
}) {
    let genesetDict: { [key: string]: string[] } = {}
    selectedSets?.forEach((geneset) => {
        const genes = geneset.genes.map((gene) => gene.gene_symbol)
        const genesetName = geneset.name
        genesetDict[genesetName] = genes
    })
    const [dataMapped, setDataMapped] = React.useState<DataPoint[]>([])
    const [loading, setLoading] = React.useState(false)
    if (!genesetDict || !selectedSets) return <></>

    React.useEffect(() => {
        setLoading(true)
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
            setLoading(false)
        }).catch((err) => console.log(err))
    }, [selectedSets])

    if (loading) return <CircularIndeterminate />
    else {
        return (
            <Scatterplot width={600} height={600} data={dataMapped} />)
    }
}

