// extracted from react
'use client'
import { type Gene, type GeneSet } from "@prisma/client";
import { VennDiagram, VennArc, VennSeries, Gradient, VennLabel, VennOuterLabel } from "reaviz";
import React from "react";

export type VennProps = {
    key: string[];
    data: number;
};

export type VennGeneProps = {
    [key: string]: string[];
};

//adapted from  https://stackoverflow.com/questions/42773836/how-to-find-all-subsets-of-a-set-in-javascript-powerset-of-array
function getAllSubsets(array: ({
    alphabet: string;
    genes: Gene[];
} & GeneSet)[]) {
    const subsets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[][] = [[]];
    for (const el of array) {
        const last = subsets.length - 1;
        for (let i = 0; i <= last; i++) {
            subsets.push([...subsets[i], el]);
        }
    }
    return subsets;
}

function calculateIntersections(possibleSubsets: ({
    alphabet: string;
    genes: Gene[];
} & GeneSet)[][]) {
    let intersectionDict: VennProps[] = []
    let intersectionGeneDict: { [key: string]: string[] } = {}
    for (let possibleSubset of possibleSubsets) {
        const subsetLength = possibleSubset.length
        let subsetGenes: string[][] = []
        possibleSubset.forEach((subset) => {
            const setGenes = subset.genes.map((gene) => gene.gene_symbol)
            subsetGenes.push(setGenes)
        })
        const subsetGenesFlat = subsetGenes.flat()
        let countArray: { [key: string]: number } = {}

        const occurrences = subsetGenesFlat.reduce(function (previousValue, currentvalue) {
            return previousValue[currentvalue] ? ++previousValue[currentvalue] : previousValue[currentvalue] = 1, previousValue
        }, countArray);

        const genes = Object.keys(occurrences).filter((gene) => occurrences[gene] === subsetLength)
        const intersectionCount = genes.length
        intersectionDict.push({ key: possibleSubset.map((subset) => subset.alphabet), data: intersectionCount })
        intersectionGeneDict[possibleSubset.map((subset) => subset.alphabet).toString()] = genes

    }
    return { intersectionDict: intersectionDict, intersectionGeneDict: intersectionGeneDict }
}


export default function VennPlot({ selectedSets, setOverlap }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined,
    setOverlap: React.Dispatch<React.SetStateAction<string[]>>;
}) {
    const [intersectionGeneDict, setIntersectionGeneDict] = React.useState<VennGeneProps>({})
    const vennData: VennProps[] = React.useMemo(() => {
        if (!selectedSets) return [];
        // get all possible combinations
        const possibleSubsets = getAllSubsets(selectedSets).slice(1)
        // use combinations to get all intersections for those combinations
        const getIntersections = calculateIntersections(possibleSubsets)
        setIntersectionGeneDict(getIntersections.intersectionGeneDict)
        return getIntersections.intersectionDict
    }, [selectedSets])
    if (selectedSets && selectedSets.length < 4) {
        return (
            <VennDiagram
                height={450}
                width={450}
                data={vennData}
                series={
                    <VennSeries
                        colorScheme="cybertron"
                        arc={<VennArc strokeWidth={3} gradient={<Gradient />}
                            onClick={(evt) => setOverlap(intersectionGeneDict[evt.value.sets])} />}
                        label={<VennLabel
                            labelType={'value'}
                            showAll={true}
                            fill={'#000000'}
                            fontSize={15} 
                            // format={(data: any) => {console.log(data.data.key); return data.data.key}}
                            />}
                        outerLabel={<VennOuterLabel                             
                            format={(data: any) => {console.log(data.data.key); return data.data.key}}
                        />}
                    />
                }
            />
        )
    } else {
        return (
            <div id='venn' style={{
                width: '90%',
                height: '80%',
                // border: 'solid 1px red',
                position: 'absolute',
                justifyContent:'center',
                alignSelf:'center',
              }}>
            <VennDiagram
                type="starEuler"
                // height={450}
                // width={450}
                data={vennData}
                margins={[3, 3, 3, 3]}
                series={
                    <VennSeries
                        colorScheme="cybertron"
                        arc={<VennArc strokeWidth={3}
                            gradient={<Gradient />}
                            onClick={(evt) => setOverlap(intersectionGeneDict[evt.value.sets])} />}
                        label={<VennLabel
                            labelType={'value'}
                            showAll={true}
                            fill={'#000000'}
                            fontSize={15} 
                            />}
                        outerLabel={<VennOuterLabel />}
                    />}
            />
            </div>
        )
    }

}
