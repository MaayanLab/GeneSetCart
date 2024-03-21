import CircularIndeterminate from "@/components/misc/Loading";
import { Gene, GeneSet } from "@prisma/client";
import React from "react"

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
    if (!genesetDict || !selectedSets) return <></>
    else {
        React.useEffect(() => {
            fetch('http://0.0.0.0:8000/api/getHeatmap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'genesets_dict': genesetDict }),
            })
            .then((response) => {console.log(response); return response.text()})
            .then((heatmapImage) => {
                console.log(heatmapImage)
                setHeatmapImageString(heatmapImage)
            }).catch((err) => console.log(err))
        }, [selectedSets])

        // const parser = new DOMParser();
        // const svgDoc = parser.parseFromString(heatmapImageString, "text/xml");
        // const svgElement = svgDoc.documentElement;

        return  <div>
            {heatmapImageString ? <img src={`data:image/svg+xml;utf8,${encodeURIComponent(heatmapImageString)}`} /> : <CircularIndeterminate />}
        </div>
    }
}