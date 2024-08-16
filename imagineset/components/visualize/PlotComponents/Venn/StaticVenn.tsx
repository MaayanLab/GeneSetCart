import CircularIndeterminate from "@/components/misc/Loading";
import { Gene, GeneSet } from "@prisma/client";
import React from "react"
import { getVenn } from "../../getImageData";

export function StaticVenn({ selectedSets }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined;
}) {
    const [imageString, setImageString] = React.useState<string | null>(null)

    React.useEffect(() => {
        let genesetDict: { [key: string]: string[] } = {}
        selectedSets?.forEach((geneset) => {
            const genes = geneset.isHumanGenes ? geneset.genes.map((gene) => gene.gene_symbol) : geneset.otherSymbols
            const genesetName = geneset.name
            genesetDict[genesetName] = genes
        })
        getVenn(genesetDict)
        .then((vennImage) => {
            setImageString(vennImage)
        }).catch((err) => console.log(err))
    }, [selectedSets])

    if (!selectedSets) return <></>
    else {
        return  <div style={{ display: 'flex', justifyContent: 'center'}}>
            {imageString ? <img alt='static-venn' src={`data:image/svg+xml;utf8,${encodeURIComponent(imageString)}`} /> : <CircularIndeterminate />}
        </div>
    }
}