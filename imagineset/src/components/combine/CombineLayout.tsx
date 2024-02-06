'use client'

import { Grid } from "@mui/material"
import {SelectGenesetsCard } from "./GeneSetCard"
import { type Gene, type GeneSet } from "@prisma/client";
import React from "react";

export function CombineLayout({sessionInfo}: {sessionInfo: {
    gene_sets: ({
        genes: Gene[];
    } & GeneSet)[];
} | null}) {

    const [selectedSets, setSelectedSets] = React.useState<({
        genes: Gene[];
    } & GeneSet)[]>([])
    return (
        <Grid container direction='row'>
        <Grid item xs={12}>
            <SelectGenesetsCard sessionGeneSets={sessionInfo ? sessionInfo?.gene_sets : []} selectedSets={selectedSets} setSelectedSets={setSelectedSets}/>
        </Grid>
        <Grid item xs={12}>
            ghg w
        </Grid>
    </Grid>
    )
}