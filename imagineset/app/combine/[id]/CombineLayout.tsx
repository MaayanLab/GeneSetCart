'use client'

import { type Gene, type GeneSet } from "@prisma/client";
import React from "react";
import { Stack } from "@mui/material";
import { GeneCombineCards } from "./GeneCombineCards";


export function CombineLayout({ sessionInfo, sessionId }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    sessionId: string
}) {
    
    return (
        <Stack direction='column' spacing={1} justifyContent="center" alignItems="center">
            <GeneCombineCards sessionId={sessionId} sessionInfo={sessionInfo}/>
        </Stack>

    )
}