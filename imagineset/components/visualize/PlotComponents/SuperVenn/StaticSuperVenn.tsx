import CircularIndeterminate from "@/components/misc/Loading";
import { Gene, GeneSet } from "@prisma/client";
import React from "react"
import { getSuperVenn } from "../../getImageData";

export function StaticSuperVenn({ selectedSets }: {
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
            const genesetName = geneset.alphabet
            genesetDict[genesetName] = genes
        })
        getSuperVenn(genesetDict)
            .then((imgString) => {
                const svgString = `data:image/svg+xml;utf8,${encodeURIComponent(imgString)}`
                setImageString(svgString)
            }).catch((err) => console.log(err))
    }, [selectedSets])
    if (!selectedSets) return <></>
    else {
        return  <div>
            {imageString ? <img alt='static-supervenn' src={imageString} /> : <CircularIndeterminate />}
        </div>
    }
}