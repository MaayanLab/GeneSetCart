'use client'

import { SelectGenesetsCard } from "./GeneSetCard"
import { type Gene, type GeneSet } from "@prisma/client";
import React from "react";
import { Card, Box, CardContent, Divider, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Stack, CardHeader, Button, Typography } from "@mui/material";
import Status from "../assemble/Status";
import { copyToClipboard } from "../assemble/DCCFetch/CFDEDataTable";
import { addToSessionSets } from "@/app/assemble/[id]/AssembleFunctions ";
import { addStatus } from "../assemble/fileUpload/SingleUpload";

export function CombineLayout({ sessionInfo, sessionId }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null, 
    sessionId: string
}) {

    const [selectedSets, setSelectedSets] = React.useState<({
        genes: Gene[];
    } & GeneSet)[]>([])
    const [consensusNum, setConsenusNum] = React.useState(0)
    const [displayedGenes, setDisplayedGenes] = React.useState<string[]>([])
    const [generatedSetName, setGeneratedSetName] = React.useState('')
    const [status, setStatus] = React.useState<addStatus>({})
    
    const unionAction = () => {
        let genes: string[] = []
        let genesetNames: string[] = []
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

    const intersectionAction = () => {
        let allGenes: string[][] = []
        let genesetNames: string[] = []
        const selectedSetsCount = selectedSets.length
        selectedSets.forEach((set) => {
            const setGenes = set.genes.map((gene) => gene.gene_symbol)
            allGenes.push(setGenes)
            genesetNames.push(set.name)
        })
        const allGenesFlat = allGenes.flat()
        let countArray: { [key: string]: number } = {}

        const occurrences = allGenesFlat.reduce(function (previousValue, currentvalue) {
            return previousValue[currentvalue] ? ++previousValue[currentvalue] : previousValue[currentvalue] = 1, previousValue
        }, countArray);

        const genes = Object.keys(occurrences).filter((gene) => occurrences[gene] === selectedSetsCount)

        setDisplayedGenes(genes)
        setGeneratedSetName(genesetNames.join(' ∩ '))
    }

    const consensusAction = () => {
        let allGenes: string[][] = []
        let genesetNames: string[] = []
        const selectedSetsCount = selectedSets.length
        selectedSets.forEach((set) => {
            const setGenes = set.genes.map((gene) => gene.gene_symbol)
            allGenes.push(setGenes)
            genesetNames.push(set.name)
        })
        const allGenesFlat = allGenes.flat()
        let countArray: { [key: string]: number } = {}

        const occurrences = allGenesFlat.reduce(function (previousValue, currentvalue) {
            return previousValue[currentvalue] ? ++previousValue[currentvalue] : previousValue[currentvalue] = 1, previousValue
        }, countArray);

        const genes = Object.keys(occurrences).filter((gene) => occurrences[gene] >= consensusNum)

        setDisplayedGenes(genes)
        setGeneratedSetName('Consenus n=' + consensusNum + ' (' + genesetNames.join(' ∩ ') + ')')
    }

    const handleAddToSets = React.useCallback(() => {
        addToSessionSets(displayedGenes, sessionId, generatedSetName, '')
        .then((response) => setStatus({success:true}))
        .catch((error) => setStatus({error:{selected:true, message:'Error adding gene set to list. Please try again'} }))
    }, [displayedGenes, generatedSetName])
    
    return (
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} justifyContent={'center'}>
            <SelectGenesetsCard sessionGeneSets={sessionInfo ? sessionInfo?.gene_sets : []} selectedSets={selectedSets} setSelectedSets={setSelectedSets} />
            <Box sx={{ minWidth: 100 }}>
                <Card variant="outlined" sx={{ minHeight: 400, maxHeight: 400, overflowY: 'scroll' }}>
                    <CardHeader
                        title="Select Set Operation to Combine"
                        titleTypographyProps={{color:'secondary.dark', fontSize: 18 }}
                        style={{ textAlign: 'center' }}
                    />
                    <CardContent>
                        <Stack direction={'column'} spacing={3}>
                            <Button variant='outlined' color='tertiary' onClick={unionAction}>UNION</Button>
                            <Button variant='outlined' color='tertiary' onClick={intersectionAction}>INTERSECTION</Button>
                            <Button variant='outlined' color='tertiary' onClick={consensusAction}>CONSENSUS</Button>
                            <TextField
                                inputProps={{ type: 'number' }}
                                hiddenLabel
                                label="Consensus Criteria"
                                sx={{ fontSize: 16 }}
                                color='secondary'
                                name='max-Add'
                                value={consensusNum}
                                onChange={(event) => { setConsenusNum(parseInt(event.target.value)) }}
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
                        titleTypographyProps={{color:'secondary.dark', fontSize: 18 }}
                        style={{ textAlign: 'center' }}
                    />
                    <CardContent>
                        <Stack direction={'column'} spacing={2}>
                            <Typography variant='body1' color='secondary' style={{ textAlign: 'center' }}> {displayedGenes.length} valid genes found</Typography>
                            <TextField
                                id="standard-multiline-static"
                                multiline
                                rows={7}
                                disabled
                                value={displayedGenes.toString().replaceAll(',', '\n')}
                            />
                            <Stack direction={'row'} spacing={2}>
                                <Button variant='outlined' color="secondary" onClick={(event) => copyToClipboard(displayedGenes.toString().replaceAll(',', '\n'))}>
                                    COPY
                                </Button>
                                <Button variant='outlined' color="secondary" onClick={handleAddToSets}>
                                    ADD TO SETS
                                </Button>
                            </Stack>
                            <Status status={status}/>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Stack>
    )
}