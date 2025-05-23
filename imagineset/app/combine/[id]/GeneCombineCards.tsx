'use client'

import { SelectGenesetsCard } from "./GeneSetCard"
import { type Gene, type GeneSet } from "@prisma/client";
import React from "react";
import { Card, Box, CardContent, Divider, TextField, Stack, CardHeader, Button, Typography, Tooltip, FormControlLabel, Checkbox } from "@mui/material";
import Status from "../../../components/assemble/Status";
import { copyToClipboard } from "../../../components/assemble/DCCFetch/CFDEDataTable";
import { addToSessionSets, checkInSession, checkValidGenes } from "@/app/assemble/[id]/AssembleFunctions";
import { addStatus } from "../../../components/assemble/fileUpload/SingleUpload";
import InfoIcon from '@mui/icons-material/Info';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const scrollbarStyles = {
    'webkitAppearance': 'none',
    'width': '10px'
};

const scrollbarThumb = {
    'borderRadius': '5px',
    'backgroundColor': 'rgba(0,0,0,.5)',
    'WebkitBoxShadow': '0 0 1px rgba(255,255,255,.5)'
}

export function GeneCombineCards({ sessionId, sessionInfo }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    sessionId: string,
}) {
    const [selectedSets, setSelectedSets] = React.useState<({
        genes: Gene[];
    } & GeneSet)[]>([])
    const [consensusNum, setConsenusNum] = React.useState(0)
    const [displayedGenes, setDisplayedGenes] = React.useState<string[]>([])
    const [generatedSetName, setGeneratedSetName] = React.useState('')
    const [status, setStatus] = React.useState<addStatus>({})
    const [isHumanGenes, setIsHumanGenes] = React.useState(true)
    const [normalizeCasing, setNormalizeCasing] = React.useState(false)
    const [validGenes, setValidGenes] = React.useState<string[]>([])


    const unionAction = () => {
        let genes: string[] = []
        let genesetNames: string[] = []
        selectedSets.forEach((set) => {
            const setGenes = set.otherSymbols.length === 0 ? set.genes.map((gene) => gene.gene_symbol) : set.otherSymbols
            for (let geneSymbol of setGenes) {
                if (!genes.includes(geneSymbol)) {
                    if (normalizeCasing)  genes.push(geneSymbol.toUpperCase())
                    else genes.push(geneSymbol)
                }
            }
            genesetNames.push(set.name)
        })
        setDisplayedGenes(genes)
        setGeneratedSetName(genesetNames.join(' ∪ '))
        checkValidGenes(genes.join('\n')).then((result) => setValidGenes(result))
    }

    const intersectionAction = () => {
        let allGenes: string[][] = []
        let genesetNames: string[] = []
        const selectedSetsCount = selectedSets.length
        selectedSets.forEach((set) => {
            const setGenes = set.otherSymbols.length === 0 ? set.genes.map((gene) => gene.gene_symbol) : set.otherSymbols
            allGenes.push(setGenes)
            genesetNames.push(set.name)
        })
        const allGenesFlat = allGenes.flat()
        let countArray: { [key: string]: number } = {}

        const occurrences = allGenesFlat.reduce(function (previousValue, currentvalue) {
            if (normalizeCasing) return previousValue[currentvalue.toUpperCase()] ? ++previousValue[currentvalue.toUpperCase()] : previousValue[currentvalue.toUpperCase()] = 1, previousValue
            else  return previousValue[currentvalue] ? ++previousValue[currentvalue] : previousValue[currentvalue] = 1, previousValue
        }, countArray);

        const genes = Object.keys(occurrences).filter((gene) => occurrences[gene] === selectedSetsCount)
        setDisplayedGenes(genes)
        setGeneratedSetName(genesetNames.join(' ∩ '))
        checkValidGenes(genes.join('\n')).then((result) => setValidGenes(result))

        console.log(validGenes, displayedGenes)
    }

    const subtractAction = () => {
        let toSubtractGenes: string[] = []
        let toSubtractGenesetNames: string[] = []
        selectedSets.slice(1).forEach((set) => {
            const setGenes = set.otherSymbols.length === 0 ? set.genes.map((gene) => gene.gene_symbol) : set.otherSymbols
            for (let geneSymbol of setGenes) {
                if (!toSubtractGenes.includes(geneSymbol)) {
                    if (normalizeCasing) toSubtractGenes.push(geneSymbol.toUpperCase())
                    else toSubtractGenes.push(geneSymbol)
                }
            }
            toSubtractGenesetNames.push(set.name)
        })
        const firstSelectedSet = selectedSets[0]
        const subtractedGenes = firstSelectedSet.genes.filter((gene) => {
            if (normalizeCasing) return !(toSubtractGenes.includes(gene.gene_symbol.toUpperCase()))
            else return !(toSubtractGenes.includes(gene.gene_symbol))
        }).map((gene) => gene.gene_symbol)
        setDisplayedGenes(subtractedGenes)
        setGeneratedSetName(firstSelectedSet.name + '- (' + toSubtractGenesetNames.join(' ∪ ') + ')')
        checkValidGenes(subtractedGenes.join('\n')).then((result) => setValidGenes(result))
    }


    const consensusAction = () => {
        let allGenes: string[][] = []
        let genesetNames: string[] = []
        selectedSets.forEach((set) => {
            const setGenes = set.otherSymbols.length === 0 ? set.genes.map((gene) => gene.gene_symbol) : set.otherSymbols
            allGenes.push(setGenes)
            genesetNames.push(set.name)
        })
        const allGenesFlat = allGenes.flat()
        let countArray: { [key: string]: number } = {}

        const occurrences = allGenesFlat.reduce(function (previousValue, currentvalue) {
            if (normalizeCasing) return previousValue[currentvalue.toUpperCase()] ? ++previousValue[currentvalue.toUpperCase()] : previousValue[currentvalue.toUpperCase()] = 1, previousValue
            else  return previousValue[currentvalue] ? ++previousValue[currentvalue] : previousValue[currentvalue] = 1, previousValue
        }, countArray);

        const genes = Object.keys(occurrences).filter((gene) => occurrences[gene] >= consensusNum)

        setDisplayedGenes(genes)
        setGeneratedSetName('Consensus n=' + consensusNum + ' (' + genesetNames.join(' ∩ ') + ')')
        checkValidGenes(genes.join('\n')).then((result) => setValidGenes(result))
    }

    const handleAddToSets = React.useCallback(() => {
        checkValidGenes(displayedGenes.join('\n')).then((result) => setValidGenes(result))
        checkInSession(sessionId, generatedSetName).then((response) => {
            if (response) {
                setStatus({ error: { selected: true, message: "Gene set already exists in this session!" } })
            } else {
                addToSessionSets(isHumanGenes ? validGenes : [], sessionId, generatedSetName, '', isHumanGenes ? [] : displayedGenes, isHumanGenes, null)
                    .then((response) => setStatus({ success: true }))
                    .catch((err) => {
                        if (err.message === 'No valid genes in gene set') {
                            setStatus({ error: { selected: true, message: err.message } })
                        }
                        else if (err.message === 'Empty gene set name') {
                            setStatus({ error: { selected: true, message: err.message } })
                        }
                        else {
                            setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
                        }
                    })
            }
        })
    }, [displayedGenes, validGenes, generatedSetName, sessionId, isHumanGenes])

    return (
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2} justifyContent={'center'} useFlexGap flexWrap="wrap">
            <SelectGenesetsCard sessionGeneSets={sessionInfo ? sessionInfo?.gene_sets : []} selectedSets={selectedSets} setSelectedSets={setSelectedSets} />
            <Box sx={{ minWidth: 100 }}>
                <Card variant="outlined" sx={{ minHeight: 400, height: '100%', overflowY: 'scroll' }}>
                    <CardHeader
                        title="Select Set Operation"
                        titleTypographyProps={{ color: 'secondary.dark', fontSize: 18 }}
                        style={{ textAlign: 'center' }}
                    />
                    <CardContent>
                        <Stack direction={'column'} spacing={3}>
                            <Button variant='outlined' color='tertiary' onClick={unionAction}>UNION</Button>
                            <Button variant='outlined' color='tertiary' onClick={intersectionAction}>INTERSECTION</Button>
                            <Tooltip title='Subtracts the union of other selected sets from the first selected set'>
                                <div>
                                    <Button variant='outlined' color='tertiary' fullWidth onClick={subtractAction}>SUBTRACT &nbsp; <InfoIcon /></Button>
                                </div>
                            </Tooltip>
                            <Tooltip title='Returns genes that appear in at least N(Consensus Criteria) of the selected sets'>
                                <div>
                                    <Button variant='outlined' color='tertiary' fullWidth onClick={consensusAction}>CONSENSUS &nbsp; <InfoIcon /></Button>
                                </div>
                            </Tooltip>
                            <div>
                            </div>
                            <TextField
                                inputProps={{ type: 'number' }}
                                hiddenLabel
                                label={
                                    <Tooltip title='The minimum number of gene sets that a gene has to appear in to be considered a part of the consensus gene set' placement="top">
                                        <div>
                                            <span>Consensus Criteria</span> &nbsp;
                                            <InfoIcon />
                                        </div>
                                    </Tooltip>

                                }
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
            <Box sx={{ maxWidth: 500 }}>
                <Card variant="outlined" sx={{
                    minHeight: 400, height: '100%', overflowY: 'scroll',
                    '&::-webkit-scrollbar': { ...scrollbarStyles },
                    '&::-webkit-scrollbar-thumb': { ...scrollbarThumb }
                }}
                >
                    <CardHeader
                        title="Generated Set"
                        titleTypographyProps={{ color: 'secondary.dark', fontSize: 18 }}
                        style={{ textAlign: 'center' }}
                    />
                    <CardContent>
                        <Stack direction={'column'} spacing={1}>
                            <TextField color='secondary'
                                variant='outlined'
                                size='small'
                                value={generatedSetName}
                                sx={{ marginLeft: 2, marginRight: 2 }}
                                placeholder='Enter name of selected set'
                                onChange={(evt) => setGeneratedSetName(evt.target.value)}
                                multiline
                                inputProps={{ style: { resize: "both" } }}
                            />
                            <FormControlLabel control={<Checkbox checked={isHumanGenes} onChange={(event) => {
                                setIsHumanGenes(event.target.checked);
                            }} />} label="Only accept valid human gene symbols"
                            />
                            <FormControlLabel className="" control={<Checkbox checked={normalizeCasing} onChange={(event) => {
                                setNormalizeCasing(event.target.checked);
                            }} />} label="Normalize casing"
                            />
                            <Typography variant='body1' color='secondary' style={{ textAlign: 'center' }}> {displayedGenes.length} items</Typography>
                            {isHumanGenes && <Typography variant='body1' color='secondary' style={{ textAlign: 'center' }}> {validGenes.length} valid genes found</Typography>}
                            <TextField
                                id="standard-multiline-static"
                                multiline
                                rows={7}
                                disabled
                                value={displayedGenes.toString().replaceAll(',', '\n')}
                            />
                            <Stack direction={'row'} spacing={2} justifyContent={'center'}>
                                <Button variant='outlined' color="secondary" onClick={(event) => copyToClipboard(displayedGenes.toString().replaceAll(',', '\n'))}>
                                    COPY
                                </Button>
                                <Button variant='contained' color="tertiary" onClick={handleAddToSets}>
                                    <AddShoppingCartIcon /> &nbsp;
                                    ADD TO CART
                                </Button>
                            </Stack>
                            <Status status={status} />
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Stack>
    )
}