'use client'

import { Grid } from "@mui/material"
import { GeneSetCards } from "./GeneSetCard"
import { type Gene, type GeneSet } from "@prisma/client";
import React from "react";

export function CombineLayout({sessionInfo}: {sessionInfo: {
    gene_sets: ({
        genes: Gene[];
    } & GeneSet)[];
} | null}) {

    const [selectedSets, setSelectedSets] = React.useState([])
    return (
        <Grid container direction='row'>
        <Grid item xs={12}>
            <GeneSetCards sessionGeneSets={sessionInfo ? sessionInfo?.gene_sets : []} />
        </Grid>
        <Grid item xs={12}>
            ghg w
        </Grid>
    </Grid>
    )
}