'use client'
import React from 'react';
import { type Gene, type GeneSet } from "@prisma/client";

import UpSetJS, { extractCombinations, ISetLike } from '@upsetjs/react';

const elems = [
    { name: 'A', sets: ['S1', 'S2'] },
    { name: 'B', sets: ['S1'] },
    { name: 'C', sets: ['S2'] },
    { name: 'D', sets: ['S1', 'S3'] },
];


export function Upset({ selectedSets }: {
    selectedSets: ({
        genes: Gene[];
    } & GeneSet)[] | undefined
}) {

    const data = React.useMemo(()=> {
        if (selectedSets) {
            return selectedSets.map((set) => {
                return {name: set.name, sets: set.genes.map((gene) => gene.gene_symbol)}
            })
        } else {
            return []
        }
    }, [selectedSets])

    const { sets, combinations } = React.useMemo(() => extractCombinations(elems), [elems]);
    return (
        <UpSetJS sets={sets} combinations={combinations} width={500} height={300} />
    )
}
