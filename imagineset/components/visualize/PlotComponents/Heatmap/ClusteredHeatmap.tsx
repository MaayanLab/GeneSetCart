import CircularIndeterminate from "@/components/misc/Loading";
import { Gene, GeneSet } from "@prisma/client";
import React from "react"
import { getClustermap } from "./getClustermap";

export function ClusteredHeatmap({ selectedSets, heatmapOptions }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined;
    heatmapOptions: {diagonal: boolean}
}) {
    let genesetDict: { [key: string]: string[] } = {}
    selectedSets?.forEach((geneset) => {
        const genes = geneset.genes.map((gene) => gene.gene_symbol)
        const genesetName = geneset.alphabet
        genesetDict[genesetName] = genes
    })
    
    const [heatmapImageString, setHeatmapImageString] = React.useState<string | null>(null)

    React.useEffect(() => {
        getClustermap(genesetDict, heatmapOptions)
        .then((heatmapImage) => {
            setHeatmapImageString(heatmapImage)
        }).catch((err) => console.log(err))
    }, [heatmapOptions])

    if (!genesetDict || !selectedSets) return <></>
    else {
        return  <div>
            {heatmapImageString ? <img alt='clustered-heatmap' src={`data:image/svg+xml;utf8,${encodeURIComponent(heatmapImageString)}`} /> : <CircularIndeterminate />}
        </div>
    }
}