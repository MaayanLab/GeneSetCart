'use client'

import { SelectGenesetsCard } from "./GeneSetCard"
import { type Gene, type GeneSet } from "@prisma/client";
import React from "react";
import { Card, Box, CardContent, Divider, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Stack, CardHeader, Button, Typography } from "@mui/material";

export function CombineLayout({ sessionInfo }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null
}) {

    const [selectedSets, setSelectedSets] = React.useState<({
        genes: Gene[];
    } & GeneSet)[]>([])
    const [consensus, setConsenus] = React.useState({selected: false, consensusNum: selectedSets.length})
    const [displayedGenes, setDisplayedGenes] = React.useState<string[]>([])
    const [generatedSetName, setGeneratedSetName] = React.useState('')
    const unionAction = () => {
        let genes : string[] = []
        let genesetNames : string[] = []
        selectedSets.forEach((set) => {
            const setGenes = set.genes.map((gene) => gene.gene_symbol)
            for (let geneSymbol of setGenes) {
                if (!genes.includes(geneSymbol)) {
                    genes.push(geneSymbol)
                }
            }
            genesetNames.push(set.name)
        })

        setDisplayedGenes(genes)
        setGeneratedSetName(genesetNames.join(' ∪ '))
    }

    return (
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} justifyContent={'center'}>
            <SelectGenesetsCard sessionGeneSets={sessionInfo ? sessionInfo?.gene_sets : []} selectedSets={selectedSets} setSelectedSets={setSelectedSets} />
            <Box sx={{ minWidth: 100 }}>
                <Card variant="outlined" sx={{ minHeight: 400, maxHeight: 400, overflowY: 'scroll' }}>
                    <CardHeader
                        title="Select Set Operation to Combine"
                    />
                    <CardContent>
                        <Stack direction={'column'} spacing={3}>
                            <Button variant='outlined' color='tertiary' onClick={unionAction}>UNION</Button>
                            <Button variant='outlined' color='tertiary'>INTERSECTION</Button>
                            <Button variant='outlined' color='tertiary'>CONSENSUS</Button>
                            <TextField
                                inputProps={{ type: 'number' }}
                                hiddenLabel
                                label="Consensus Criteria"
                                sx={{ fontSize: 16 }}
                                color='secondary'
                                name='max-Add'
                                value={consensus.consensusNum}
                                fullWidth
                            />
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
            <Box sx={{ maxWidth: 400 }}>
                <Card variant="outlined" sx={{ minHeight: 400, maxHeight: 400, overflowY: 'scroll' }}>
                    <CardHeader
                        title="Generated Set"
                        subheader={generatedSetName}
                    />
                    <CardContent>
                        <Stack direction={'column'} spacing={2}>
                        <Typography variant='body1' color='secondary'> {displayedGenes.length} valid genes found</Typography>
                            <TextField
                                id="standard-multiline-static"
                                multiline
                                rows={10}
                                disabled
                                value={displayedGenes.toString().replaceAll(',', '\n')}
                            />
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Stack>
    )
}