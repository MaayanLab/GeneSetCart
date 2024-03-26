import CircularIndeterminate from "@/components/misc/Loading";
import { Gene, GeneSet } from "@prisma/client";
import React from "react"
import { getClustermap } from "./getClustermap";

export function ClusteredHeatmap({ selectedSets }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined;
}) {
    let genesetDict: { [key: string]: string[] } = {}
    selectedSets?.forEach((geneset) => {
        const genes = geneset.genes.map((gene) => gene.gene_symbol)
        const genesetName = geneset.name
        genesetDict[genesetName] = genes
    })
    
    const [heatmapImageString, setHeatmapImageString] = React.useState<string | null>(null)

    React.useEffect(() => {
        getClustermap(genesetDict)
        .then((heatmapImage) => {
            setHeatmapImageString(heatmapImage)
        }).catch((err) => console.log(err))
    }, [])

    if (!genesetDict || !selectedSets) return <></>
    else {
        return  <div>
            {heatmapImageString ? <img alt='clustered-heatmap' src={`data:image/svg+xml;utf8,${encodeURIComponent(heatmapImageString)}`} /> : <CircularIndeterminate />}
        </div>
    }
}