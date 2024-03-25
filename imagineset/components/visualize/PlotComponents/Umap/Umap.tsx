import { Gene, GeneSet } from "@prisma/client";
import React from "react";
import { DataPoint, Scatterplot } from "./Scatterplot";
import CircularIndeterminate from "@/components/misc/Loading";
import { UMAPOptionsType } from "@/app/visualize/[id]/VisualizeLayout";


export function UMAP({ selectedSets, setOverlap, umapOptions }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined;
    setOverlap: React.Dispatch<React.SetStateAction<string[]>>;
    umapOptions: UMAPOptionsType
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
            body: JSON.stringify({ 'genesetGenes': genesetDict, 'umapOptions': umapOptions }),
        }).then((response) => response.json()).then((parsedUMAP) => {
            const dataMapped = parsedUMAP.map((datapoint: string[]) => {
                return ({
                    x: datapoint[0],
                    y: datapoint[1],
                    group: datapoint[2],
                    subGroup: datapoint[3],
                    genes: genesetDict[datapoint[3]]
                })
            });
            setDataMapped(dataMapped)
            setLoading(false)
        }).catch((err) => {setLoading(true); console.log(err)})
    }, [selectedSets, umapOptions])

    if (loading) return <CircularIndeterminate />
    else {
        if (umapOptions.assignGroups === false) {
            return (<Scatterplot width={600} height={600} data={dataMapped} setOverlap={setOverlap}/>)
        } else if (umapOptions.assignGroups === true && umapOptions.dataGroups) {
            const newDataMapped = dataMapped.map((datapoint) => {
                const newGroup = umapOptions.dataGroups ? umapOptions.dataGroups[datapoint.subGroup] : 'unknown'
                return { ...datapoint, group: newGroup }
            })
            return (<Scatterplot width={600} height={600} data={newDataMapped} setOverlap={setOverlap}/>)
        }
    }
}

