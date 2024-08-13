'use client'
import React, { useEffect } from "react";
import {
    Button, Checkbox, Container, FormControlLabel, Grid, Stack, Switch, TextField,
    Tooltip,
    Typography, useMediaQuery,
    useTheme
} from "@mui/material";
import { addToSessionByGenesetId, addToSessionSets, checkInSession, checkValidGenes, loadTxtExample } from "../../../app/assemble/[id]/AssembleFunctions ";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Status from "../Status";
import { getGenesetInfo } from "@/app/shallowcopy";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';

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
    const [isHumanGenes, setIsHumanGenes] = React.useState(false)

    const searchParams = useSearchParams();
    const urlParams = new URLSearchParams(searchParams);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const genesetId = queryParams.geneset_id
        const add = queryParams.add
        if (typeof (genesetId) === 'string') {
            const sessionId = params.id
            getGenesetInfo(genesetId).then((geneset) => {
                if (geneset) {
                    if (geneset.genes.length > 0) {
                        setIsHumanGenes(true)
                        setGenesetInfo({ name: geneset.name, genes: geneset.genes.map((gene) => gene.gene_symbol).join('\n'), description: geneset.description })
                    } else{
                        setGenesetInfo({ name: geneset.name, genes: geneset.otherSymbols.join('\n'), description: geneset.description })
                    }
                    if (add === 'true') {
                        addToSessionByGenesetId(sessionId, geneset).then((response) => {
                            if (response.success) {
                                setStatus({ success: true })
                            } else {
                                setStatus({ error: { selected: true, message: response.error } })
                            }
                            urlParams.set('add', 'false')
                            const queryString = urlParams.toString();
                            const updatedPath = queryString ? `${pathname}?${queryString}` : pathname;
                            router.push(updatedPath);
                        })
                    }
                }
            })
        }
    }, [])

    const getExample = React.useCallback(() => {
        loadTxtExample().then((response) => setGenesetInfo({ name: 'example gene set', genes: response, description: '' }));
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
                        if (genesetInfo) {
                            setGenesetInfo({ ...genesetInfo, genes: reader.result.toString() })
                        }
                        else {
                            setGenesetInfo({ name: '', genes: reader.result.toString(), description: '' })
                        }

                    }
                },
                false,
            );

            if (fileList[0]) {
                reader.readAsText(fileList[0]);
            }
        }
    }, [genesetInfo, isHumanGenes])

    useEffect(() => {
        if (genesetInfo) {
            checkValidGenes(genesetInfo.genes).then((response) => setValidGenes(response))
        }
    }, [genesetInfo])

    const submitGeneset = React.useCallback((evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.preventDefault();
        try {
            const genesetName = genesetInfo?.name
            const otherSymbolsArray = genesetInfo ? genesetInfo?.genes.split('\n').filter((gene) => gene != '') : []
            let description = genesetInfo?.description
            if (!genesetName) throw new Error('No gene set name')
            if (!description) description = ''
            const sessionId = params.id
            checkInSession(sessionId, genesetName).then((response) => {
                if (response) {
                    setStatus({ error: { selected: true, message: "Gene set already exists in this session!" } })
                } else {
                    if (isHumanGenes) {
                        addToSessionSets(validGenes, sessionId, genesetName, description ? description : '', [], isHumanGenes)
                            .then((result) => { setStatus({ success: true }) })
                            .catch((err) => {
                                if (err.message === 'No valid genes in gene set') {
                                    setStatus({ error: { selected: true, message: err.message } })
                                } else {
                                    setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
                                }
                            })
                    } else {
                        addToSessionSets([], sessionId, genesetName, description ? description : '', otherSymbolsArray, isHumanGenes)
                            .then((result) => { setStatus({ success: true }) })
                            .catch((err) => {
                                if (err.message === 'No valid genes in gene set') {
                                    setStatus({ error: { selected: true, message: err.message } })
                                } else {
                                    setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
                                }
                            })
                    }

                }
            })
        } catch (err) {
            if (err instanceof Error) {
                setStatus({ error: { selected: true, message: err.message } })
            }
        }

    }, [genesetInfo, validGenes, isHumanGenes])

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
                    <FormControlLabel control={<Checkbox checked={isHumanGenes} onChange={(event) => {
                        setIsHumanGenes(event.target.checked);
                    }} />} label="Only accept valid human gene symbols"
                    />
                    <Grid item>
                        <TextField
                            id="outlined-basic"
                            required label={isHumanGenes ? "Gene Set Name" : "Set Name"}
                            variant="outlined"
                            value={genesetInfo ? genesetInfo?.name : ''}
                            focused={genesetInfo ? true : false}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenesetInfo(genesetInfo ? { ...genesetInfo, name: event.target.value } : { name: event.target.value, genes: '', description: '' })
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
                            placeholder={isHumanGenes ? "Gene Set Description (optional)" : "Set Description (optional)"}
                            value={genesetInfo ? genesetInfo?.description : ''}
                            focused={genesetInfo ? true : false}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenesetInfo(genesetInfo ? { ...genesetInfo, description: event.target.value } : { name: '', genes: '', description: event.target.value })
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
                                <UploadIcon /> UPLOAD FILE
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
                                <DownloadIcon /> DOWNLOAD EXAMPLE
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
                <Grid direction='column' item container spacing={3} xs={isMobile ? 12 : 5}>
                    <Grid item container justifyContent={'center'} alignItems={'center'} direction='column'>
                        <Typography variant='body1' color='secondary'> {genesetInfo ? genesetInfo.genes.split('\n').filter((item) => item != '').length : 0} items found </Typography>
                        <Typography variant='body1' color='secondary'> {validGenes?.length} valid genes found</Typography>
                        <TextField
                            id="standard-multiline-static"
                            multiline
                            rows={10}
                            placeholder={isHumanGenes ? "Paste gene symbols here" : "Paste set identifiers here"}
                            value={genesetInfo ? genesetInfo.genes : ''}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenesetInfo(genesetInfo ? { ...genesetInfo, genes: event.target.value } : { name: '', genes: event.target.value, description: '' })
                            }}
                        />
                    </Grid>
                    <Grid container item spacing={2} sx={{ mt: 1 }} justifyContent={'center'}>
                        <Grid item>
                            <Button onClick={getExample} variant='contained' color="primary">
                                TRY EXAMPLE
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant='contained' color="tertiary" onClick={(evt) => submitGeneset(evt)}>
                                <AddShoppingCartIcon /> &nbsp;
                                ADD TO CART
                            </Button>
                        </Grid>
                    </Grid>
                    <Status status={status} />
                </Grid>
            </Grid>
        </Container>
    )
}