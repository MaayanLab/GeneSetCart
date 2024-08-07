import CircularIndeterminate from "@/components/misc/Loading";
import { Gene, GeneSet } from "@prisma/client";
import React from "react"
import { getClustermap } from "../../getImageData";

export function ClusteredHeatmap({ selectedSets, heatmapOptions }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined;
    heatmapOptions: { diagonal: boolean, palette: string, fontSize: number, disableLabels: boolean }
}) {
    const [heatmapImageString, setHeatmapImageString] = React.useState<string | null>(null)

    React.useEffect(() => {
        let genesetDict: { [key: string]: string[] } = {}
        selectedSets?.forEach((geneset) => {
            const genes = geneset.isHumanGenes ? geneset.genes.map((gene) => gene.gene_symbol) : geneset.otherSymbols
            const genesetName = geneset.alphabet
            genesetDict[genesetName] = genes
        })
        getClustermap(genesetDict, heatmapOptions)
        .then((heatmapImage) => {
            setHeatmapImageString(heatmapImage)
        }).catch((err) => console.log(err))
    }, [heatmapOptions, selectedSets])

    if (!selectedSets) return <></>
    else {
        return  <div>
            {heatmapImageString ? <img alt='clustered-heatmap' src={`data:image/svg+xml;utf8,${encodeURIComponent(heatmapImageString)}`} /> : <CircularIndeterminate />}
        </div>
    }
}