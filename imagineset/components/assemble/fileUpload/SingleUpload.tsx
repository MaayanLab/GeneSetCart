'use client'
import React, { useEffect } from "react";
import {
    Box, Button, Container,
    FormControl, Grid, InputLabel,
    MenuItem, Select, Stack, TextField,
    Typography, useMediaQuery,
    useTheme
} from "@mui/material";
import { addToSessionSets, checkInSession, checkValidGenes, loadTxtExample } from "../../../app/assemble/[id]/AssembleFunctions ";
import { useParams } from "next/navigation";
import Status from "../Status";
import { getGenesetInfo } from "@/app/shallowcopy";

export type addStatus = {
    success?: boolean,
    loading?: boolean,
    error?: {
        selected: boolean;
        message: string
    },
}

type genesetInfo = { name: string, genes: string, description: string | null }

export default function SingleUpload({ queryParams }: { queryParams: Record<string, string | string[] | undefined> }) {
    const theme = useTheme();
    const params = useParams<{ id: string }>()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [validGenes, setValidGenes] = React.useState<string[]>([])
    const [status, setStatus] = React.useState<addStatus>({})
    const [genesetInfo, setGenesetInfo] = React.useState<genesetInfo>()

    useEffect(() => {
        const genesetId = queryParams.geneset_id
        if (typeof (genesetId) === 'string') {
            getGenesetInfo(genesetId).then((geneset) => {
                if (geneset) {
                    setGenesetInfo({ name: geneset.name, genes: geneset.genes.map((gene) => gene.gene_symbol).join('\n'), description: geneset.description })
                }
            })
        }
    }, [])

    const getExample = React.useCallback(() => {
        loadTxtExample().then((response) => setGenesetInfo(genesetInfo ? { ...genesetInfo, name: 'example gene set', genes: response } : { name: '', genes: '', description: '' }));
    }, [genesetInfo])


    const downloadExample = React.useCallback(() => {
        loadTxtExample().then((response) => {
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(response));
            element.setAttribute('download', 'example.txt');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        })
    }, [])

    const readFile = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (fileList) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    if (reader.result) {
                        setGenesetInfo(genesetInfo ? { ...genesetInfo, genes: reader.result.toString() } : { name: '', genes: '', description: '' })
                    }
                },
                false,
            );

            if (fileList[0]) {
                reader.readAsText(fileList[0]);
            }
        }
    }, [genesetInfo])


    useEffect(() => {
        if (genesetInfo) {
            checkValidGenes(genesetInfo.genes).then((response) => setValidGenes(response))
        }
    }, [genesetInfo])

    const submitGeneset = React.useCallback((evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.preventDefault();
        const genesetName = genesetInfo?.name
        let description = genesetInfo?.description
        if (!genesetName) throw new Error('no gene set name')
        if (!description) description = ''
        const sessionId = params.id
        checkInSession(sessionId, genesetName).then((response) => {
            if (response) {
                setStatus({ error: { selected: true, message: "Gene set already exists in this session!" } })
            } else {
                addToSessionSets(validGenes, sessionId, genesetName, description ? description : '').then((result) => { setStatus({ success: true }) }).catch((err) => {
                    if (err.message === 'No valid genes in gene set') {
                        setStatus({ error: { selected: true, message: err.message } })
                    } else {
                        setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
                    }
                })
            }
        })
    }, [genesetInfo, validGenes])

    return (
        <Container>
            <Typography variant="h3" color="secondary.dark" className='p-5'>UPLOAD SINGLE GENE SET</Typography>
            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                Upload a single .txt file containing gene symbols, each on new line OR paste your gene set in
                the text box below
            </Typography>
            <Grid container display={isMobile ? 'block' : 'flex'} spacing={1} justifyContent="center"
            >
                <Grid direction='column' container item spacing={2} xs={isMobile ? 12 : 5} justifyItems='center' alignItems={'center'} justifyContent={'center'}>
                    <Grid item>
                        <TextField
                            id="outlined-basic"
                            required label="Gene Set Name"
                            variant="outlined"
                            value={genesetInfo?.name}
                            focused={genesetInfo ? true : false}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenesetInfo(genesetInfo ? { ...genesetInfo, name: event.target.value } : { name: '', genes: '', description: '' })
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            id="outlined-basic"
                            label="Description"
                            variant="outlined"
                            rows={4}
                            multiline
                            placeholder="Gene Set Description (optional)"
                            value={genesetInfo?.description}
                            focused={genesetInfo ? true : false}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenesetInfo(genesetInfo ? { ...genesetInfo, description: event.target.value } : { name: '', genes: '', description: '' })
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <Stack direction='row' spacing={2}>
                            <Button
                                variant="contained"
                                component="label"
                                onClick={(event) => {
                                    const inputFile = document.getElementById('single-file-input');
                                    if (inputFile) {
                                        return inputFile.onclick
                                    }
                                }}
                            >
                                Upload File
                                <input
                                    id='single-file-input'
                                    hidden
                                    type="file"
                                    onChange={(event) => { readFile(event) }}
                                />
                            </Button>
                            <Button
                                variant="contained"
                                onClick={downloadExample}>
                                Download Example
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
                <Grid direction='column' item container spacing={3} xs={isMobile ? 12 : 5}>
                    <Grid item container justifyContent={'center'} alignItems={'center'} direction='column'>
                        <Typography variant='body1' color='secondary'> {validGenes?.length} valid genes found</Typography>
                        <TextField
                            id="standard-multiline-static"
                            multiline
                            rows={10}
                            placeholder="Paste gene symbols here"
                            value={genesetInfo?.genes}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenesetInfo(genesetInfo ? { ...genesetInfo, genes: event.target.value } : { name: '', genes: '', description: '' })
                            }}
                        />
                    </Grid>
                    <Grid container item spacing={2} sx={{ mt: 1 }} justifyContent={'center'}>
                        <Grid item>
                            <Button onClick={getExample} variant='outlined' color="secondary">
                                TRY EXAMPLE
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant='outlined' color="secondary" onClick={(evt) => submitGeneset(evt)}>
                                ADD TO SETS
                            </Button>
                        </Grid>
                    </Grid>
                    <Status status={status} />
                </Grid>
            </Grid>
        </Container>
    )
}