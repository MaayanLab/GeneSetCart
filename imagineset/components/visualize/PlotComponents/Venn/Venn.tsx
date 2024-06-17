// extracted from react
'use client'
import { type Gene, type GeneSet } from "@prisma/client";
import { VennDiagram, VennArc, VennSeries, Gradient, VennLabel, VennOuterLabel } from "reaviz";
import React from "react";
import { OverlapSelection } from "@/app/visualize/[id]/VisualizeLayout";

function haveCommonItems(arr1: string[], arr2: string[]) {
    const set1 = new Set(arr1);
    const commonItems = arr2.filter(item => set1.has(item));
    return commonItems.length > 0;
}

function checkSubsetContained(arr1: string[], arr2: string[]) {
    // returns true for arr1: [A, B] arr2: [A, B, C] if all elements in [A,B] are in [A,B,C] ie arr1 is a subset of arr2
    return arr1.every(element => arr2.includes(element))
}


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

        const genes = Object.keys(occurrences).filter((gene) => occurrences[gene] === subsetLength) // get intersecting genes 
        const intersectionCount = genes.length
        intersectionDict.push({ key: possibleSubset.map((subset) => subset.alphabet), data: intersectionCount })
        intersectionGeneDict[possibleSubset.map((subset) => subset.alphabet).toString()] = genes
    }

    // for each set, get all other that it is a subset of and the subtract to get intersection genes 
    let finalIntersectionDict: VennProps[] = []
    let finalIntersectionGeneDict: { [key: string]: string[] } = {}
    for (let intersectionSet of Object.keys(intersectionGeneDict)) {
        const allSets = Object.keys(intersectionGeneDict)
        let containerSets = allSets.filter((setItem) => checkSubsetContained(intersectionSet.split(','), setItem.split(',')) && setItem !== intersectionSet)
        let allContainerSetGenes = containerSets.map((containerSet) => intersectionGeneDict[containerSet]).flat()
        let correctIntersectionGenes = intersectionGeneDict[intersectionSet].filter((gene) => !(allContainerSetGenes.includes(gene)))
        finalIntersectionGeneDict[intersectionSet] = correctIntersectionGenes
        finalIntersectionDict.push({key: intersectionSet.split(','), data: correctIntersectionGenes.length})
    }
    return { intersectionDict: finalIntersectionDict, intersectionGeneDict: finalIntersectionGeneDict }
}


export default function VennPlot({ selectedSets, setOverlap, vennOptions }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined,
    setOverlap: React.Dispatch<React.SetStateAction<OverlapSelection>>,
    vennOptions: { palette: string }
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
    return (
        <div id='venn' style={{
            width: '60%',
            height: '80%',
            position: 'absolute',
            justifyContent: 'center',
            alignSelf: 'center',
        }}>
            <VennDiagram
                type="starEuler"
                data={vennData}
                margins={[3, 3, 3, 3]}
                series={
                    <VennSeries
                    colorScheme={vennOptions.palette}
                        arc={<VennArc strokeWidth={3}
                            gradient={<Gradient />}
                            onClick={(evt) => setOverlap({ name: evt.value.sets.sort().toString(), overlapGenes: intersectionGeneDict[evt.value.sets.sort().toString()] })} />}
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
