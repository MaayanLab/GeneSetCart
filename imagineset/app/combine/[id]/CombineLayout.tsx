'use client'

import { type Gene, type GeneSet } from "@prisma/client";
import React from "react";
import { Switch, Stack, Typography, Tooltip } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { GeneCombineCards } from "./GeneCombineCards";
import { OtherCombineCards } from "./OtherCombineCards";


export function CombineLayout({ sessionInfo, sessionId }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    sessionId: string
}) {
    const [isHumanGenes, setIsHumanGenes] = React.useState(true)



    return (
        <Stack direction='column' spacing={1} justifyContent="center" alignItems="center">
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <Tooltip title='Combine sets consisting of identifiers other than human entrez gene symbols e.g drugs, other organism symbols.'>
                    <HelpOutlineIcon color="secondary" />
                </Tooltip>
                <Typography color={'purple'}>Other</Typography>
                <Switch
                    color="secondary"
                    checked={isHumanGenes}
                    onChange={() => setIsHumanGenes(!isHumanGenes)}
                    sx={{
                        "&.MuiSwitch-root .MuiSwitch-switchBase": {
                            color: "purple"
                        },

                        "&.MuiSwitch-root .Mui-checked": {
                            color: "#336699"
                        }
                    }}
                />
                <Typography color={'secondary'} >Human Gene Symbols</Typography>
                <Tooltip title='Combine sets only consisting of human entrez gene symbols'>
                    <HelpOutlineIcon color='secondary' />
                </Tooltip>
            </Stack>
            {isHumanGenes ? <GeneCombineCards sessionId={sessionId} sessionInfo={sessionInfo}/> : <OtherCombineCards sessionId={sessionId} sessionInfo={sessionInfo}/>}
        </Stack>

    )
}