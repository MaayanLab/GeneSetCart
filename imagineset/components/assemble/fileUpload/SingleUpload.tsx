'use client'
import React, { useEffect } from "react";
import {
    Button, Checkbox, Select, Chip, Container, FormControlLabel, Grid, Stack, Switch, TextField,
    Tooltip, FormControl, MenuItem, InputLabel,
    Typography, useMediaQuery,
    useTheme,
    SelectChangeEvent,
} from "@mui/material";
import { addToSessionByGenesetId, 
        addToSessionSets, 
        checkInSession, 
        checkValidGenes, 
        loadTxtExample, 
        convertGeneSpecies, 
        computeHash, 
        getGeneBackgrounds} from "../../../app/assemble/[id]/AssembleFunctions";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Status from "../Status";
import { getGenesetInfo } from "@/app/shallowcopy";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import { getPrivateSession } from "./getSessionPrivate";
import { CircularIndeterminateSm } from "@/components/misc/Loading";

export type addStatus = {
    success?: boolean,
    loading?: boolean,
    error?: {
        selected: boolean;
        message: string
    },
}

export const MenuProps = {
    sx: {
      "&& .Mui-selected": {
        backgroundColor: "#7187C3"
      }
    },
}


const speciesMap: Record<string, string> = {
        'Homo sapiens': 'Mammalia/Homo_sapiens',
        'Mus musculus': 'Mammalia/Mus_musculus',
        'Rattus norvegicus': 'Mammalia/Rattus_norvegicus',
        'Pan troglodytes': 'Mammalia/Pan_troglodytes',
        'Sus scrofa': 'Mammalia/Sus_scrofa',
        'Bos taurus': 'Mammalia/Bos_taurus',
        'Canis familiaris': 'Mammalia/Canis_familiaris',
        'Danio reri': 'Non-mammalian_vertebrates/Danio_reri',
        'Gallus gallus': 'Non-mammalian_vertebrates/Gallus_gallus',
        'Xenopus laevis': 'Non-mammalian_vertebrates/Xenopus_laevis',
        'Xenopus tropicalis': 'Non-mammalian_vertebrates/Xenopus_tropicalis',
        'Anopheles gambiae': 'Invertebrates/Anopheles_gambiae',
        'Caenorhabditis elegans': 'Invertebrates/Caenorhabditis_elegans',
        'Drosophila melanogaster': 'Invertebrates/Drosophila_melanogaster',
        'Arabidopsis thaliana': 'Plants/Arabidopsis_thaliana',
        'Chlamydomonas reinhardtii': 'Plants/Chlamydomonas_reinhardtii',
        'Oryza sativa': 'Plants/Oryza_sativa',
        'Zea mays': 'Plants/Zea_mays'
}

type genesetInfo = { name: string, genes: string, description: string | null, backgroundGenes: string }

export default function SingleUpload({ queryParams }: { queryParams: Record<string, string | string[] | undefined> }) {
    const theme = useTheme();
    const params = useParams<{ id: string }>()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [geneValidation, setGeneValidation] = React.useState(false)
    const [validHumanGenes, setValidHumanGenes] = React.useState<string[]>([])
    const [convertedSymbols, setConvertedSymbols] = React.useState<string[]>([])
    const [validGeneSymbols, setValidGeneSymbols] = React.useState(true)
    const [status, setStatus] = React.useState<addStatus>({})
    const [genesetInfo, setGenesetInfo] = React.useState<genesetInfo>()
    const [species, setSpecies] = React.useState('Mammalia/Homo_sapiens')
    const isHumanGenes = React.useMemo(() => species == 'Mammalia/Homo_sapiens' && validGeneSymbols, [species, validGeneSymbols])
    const [privateSession, setPrivateSession] = React.useState(false)
    const [genesLoading, setGenesLoading] = React.useState(false)
    const [addBackground, setAddBackground] = React.useState(false)
    const [backgroundGenesLoading, setBackgroundGenesLoading] = React.useState(false)
    const [convertedBackgroundSymbols, setConvertedBackgroundSymbols] = React.useState<string[]>([])
    const [precomputedBackground, setPrecomputedBackground] = React.useState("custom")

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
                        setGenesetInfo({ name: geneset.name, genes: geneset.genes.map((gene) => gene.gene_symbol).join('\n'), description: geneset.description, backgroundGenes: ''  })
                    } else {
                        setGenesetInfo({ name: geneset.name, genes: geneset.otherSymbols.join('\n'), description: geneset.description, backgroundGenes: '' })
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
        getPrivateSession(params.id).then((response: boolean | null) => {
            if (response) {
                setPrivateSession(response)
            }
        })
    }, [])

    const getExample = React.useCallback(() => {
        loadTxtExample().then((response) => setGenesetInfo({ name: 'example gene set', genes: response, description: '', backgroundGenes: '' }));
        setAddBackground(false)
        setConvertedBackgroundSymbols([])
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
                            setGenesetInfo({ name: '', genes: reader.result.toString(), description: '', backgroundGenes: '' })
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
        if (genesetInfo?.genes && validGeneSymbols) {
            setGenesLoading(true)
            convertGeneSpecies(genesetInfo.genes, species).then((response) => {
                setConvertedSymbols(response)
                setGenesLoading(false)
            })
        }
    }, [genesetInfo?.genes, validGeneSymbols, setConvertedSymbols, species])

    useEffect(() => {
        if (genesetInfo?.backgroundGenes && validGeneSymbols) {
            setBackgroundGenesLoading(true)
            convertGeneSpecies(genesetInfo.backgroundGenes, species).then((response) => {
                setConvertedBackgroundSymbols(response)
                setBackgroundGenesLoading(false)
            })
        }
    }, [genesetInfo?.backgroundGenes, validGeneSymbols, setConvertedBackgroundSymbols, species])

    useEffect(() => {
        if (convertedSymbols.length > 0) {
            checkValidGenes(convertedSymbols.filter((g) => g).join('\n')).then((response) => setValidHumanGenes(response))
        }
    }, [convertedSymbols, setValidHumanGenes])


    const submitGeneset = React.useCallback((evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.preventDefault();
        try {
            const genesetName = genesetInfo?.name
            const otherSymbolsArray = genesetInfo ? genesetInfo?.genes.split('\n').filter((gene) => gene != '') : []
            let description = genesetInfo?.description
            if (!genesetName) throw new Error('No gene set name')
            if (!description) description = ''
            let background = null;
            if (validGeneSymbols && convertedBackgroundSymbols.length > 0) {
                background = convertedBackgroundSymbols.filter((g) => g && g != '')
            } else if (genesetInfo && genesetInfo?.backgroundGenes.split('\n').length > 0) {
                background = genesetInfo?.backgroundGenes.split('\n').filter((g) => g != '')
            }
            const sessionId = params.id
            console.log(isHumanGenes, validGeneSymbols, validHumanGenes, background, otherSymbolsArray)
            checkInSession(sessionId, genesetName).then((response) => {
                if (response) {
                    setStatus({ error: { selected: true, message: "Gene set already exists in this session!" } })
                } else {
                    if (isHumanGenes) {
                        addToSessionSets(validHumanGenes, sessionId, genesetName, description ? description : '', [], isHumanGenes, background)
                            .then((result) => { setStatus({ success: true }) })
                            .catch((err) => {
                                if (err.message === 'No valid genes in gene set') {
                                    setStatus({ error: { selected: true, message: err.message } })
                                } else {
                                    setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
                                }
                            })
                    } else if (validGeneSymbols) {
                        addToSessionSets(validHumanGenes, sessionId, genesetName, description ? description : '', convertedSymbols, isHumanGenes, background)
                            .then((result) => { setStatus({ success: true }) })
                            .catch((err) => {
                                if (err.message === 'No valid genes in gene set') {
                                    setStatus({ error: { selected: true, message: err.message } })
                                } else {
                                    setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
                                }
                            })
                    } else {
                        console.log('here', otherSymbolsArray)
                        addToSessionSets([], sessionId, genesetName, description ? description : '', otherSymbolsArray, isHumanGenes, background)
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

    }, [genesetInfo, validHumanGenes, isHumanGenes, validGeneSymbols])

    const handleChange = (event: SelectChangeEvent) => {
        setSpecies(event.target.value as string);
    };

    const handleChange2 = (event: SelectChangeEvent) => {
        setPrecomputedBackground(event.target.value as string);
        if (event.target.value === 'protein-coding' || event.target.value === 'all-genes') {
            getGeneBackgrounds(event.target.value, species).then((response) => {
                setGenesetInfo(genesetInfo ? { ...genesetInfo, backgroundGenes: response.join('\n') } : { name: '', genes: '', description: '', backgroundGenes: response.join('\n') })
            })
        } else if (event.target.value === 'custom') {
            setGenesetInfo(genesetInfo ? { ...genesetInfo, backgroundGenes: '' } : { name: '', genes: '', description: '', backgroundGenes: '' })
            setConvertedBackgroundSymbols([])
        }
    };

    return (
        <Container>
            <div className='flex items-center'>
                <Typography variant="h3" color="secondary.dark" className='p-5'>UPLOAD SINGLE GENE SET</Typography>
                <Tooltip title={`Current session is ${privateSession ? 'private' : 'public'}`}>
                    <Chip label={privateSession ? 'Private' : 'Public'} variant="outlined" />
                </Tooltip>
            </div>
            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                Upload a single .txt file containing gene symbols, each on new line OR paste your gene set in
                the text box below
            </Typography>
            <Grid container display={isMobile ? 'block' : 'flex'} spacing={1} justifyContent="center"
            >
                <Grid direction='column' container item spacing={2} xs={isMobile ? 12 : 5} justifyItems='center' alignItems={'center'} justifyContent={'center'}>
                    <FormControlLabel control={<Checkbox checked={validGeneSymbols} onChange={(event) => {
                        setValidGeneSymbols(event.target.checked);
                    }} />} label="Only accept valid gene symbols"
                    />
                    {validGeneSymbols &&
                    
                    <FormControl>
                        <InputLabel id="species-select-label" sx={{ fontSize: 16 }} color='secondary'>Species</InputLabel>
                        <Select
                            labelId="species-select-label"
                            value={species}
                            label={"Species"}
                            onChange={handleChange}
                            color='secondary'
                            MenuProps={MenuProps}
                        >
                            {Object.entries(speciesMap).flatMap((item, i) => {
                                return <MenuItem key={i} value={item[1]} sx={{width: 300, wordBreak: 'break-word', whiteSpace: 'normal'}}>{item[0]}</MenuItem>
                            })}
                        </Select>
                    </FormControl>}
                    <Grid item>
                        <TextField
                            id="outlined-basic"
                            required label={validGeneSymbols ? "Gene Set Name" : "Set Name"}
                            variant="outlined"
                            value={genesetInfo ? genesetInfo?.name : ''}
                            focused={genesetInfo ? true : false}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenesetInfo(genesetInfo ? { ...genesetInfo, name: event.target.value } : { name: event.target.value, genes: '', description: '', backgroundGenes: '' })
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
                            placeholder={validGeneSymbols ? "Gene Set Description (optional)" : "Set Description (optional)"}
                            value={genesetInfo ? genesetInfo?.description : ''}
                            focused={genesetInfo ? true : false}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenesetInfo(genesetInfo ? { ...genesetInfo, description: event.target.value } : { name: '', genes: '', description: event.target.value, backgroundGenes: '' })
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
                <Grid direction='column' item container spacing={4} xs={isMobile ? 12 : 5}>
                    <Grid item container gap={1} spacing={2} justifyContent={'center'} alignItems={'center'} direction='column'>
                        <div className="flex flex-row gap-5">
                            <div className="flex-col text-center">
                                <Typography variant='body1' color='secondary'> {genesetInfo ? genesetInfo.genes.split('\n').filter((item) => item != '').length : 0} items found </Typography>
                                {validGeneSymbols &&
                                <Button className="no-wrap" variant="contained" onClick={() => setGeneValidation(true)}><Typography variant='body1' color='secondary'> {genesLoading ? <CircularIndeterminateSm/> : convertedSymbols.filter((g) => g).length} valid genes</Typography></Button>}
                            </div>
                            {addBackground && 
                            <div className="flex flex-col text-center my-auto">
                                <Typography variant='body1' color='secondary'> {genesetInfo ? genesetInfo.backgroundGenes.split('\n').filter((item) => item != '').length : 0} items found </Typography>
                                {validGeneSymbols &&
                                    <Typography variant='body1' color='secondary'> 
                                    {backgroundGenesLoading ? <CircularIndeterminateSm/> : convertedBackgroundSymbols.filter((g) => g).length} valid genes
                                    </Typography>
                                }
                            </div>
                            }
                        </div>
                        <div className="flex flex-row align-middle justify-center mx-auto ml-16">
                        {geneValidation ? 
                            <div onClick={() => setGeneValidation(false)}
                             style={{ overflow: 'scroll', height: '263px', width: '211px', padding: 10, border: '1px solid darkblue', borderRadius: '5px' }}>
                                {genesetInfo?.genes.split('\n').map((gene, index) => (
                                    <span key={index} style={{ color: convertedSymbols[index] ? 'green' : 'red' }}>
                                        {gene == convertedSymbols[index] ? <>{gene}&#x2713;</> : <>{convertedSymbols[index] ? <>{gene}&rarr;{convertedSymbols[index]}</> : <>{gene}&#x2715;</> }</>}
                                        {index < genesetInfo.genes.split('\n').length - 1 && <br />}
                                    </span>
                                ))}
                            </div>
                            : 
                            <TextField
                            id="standard-multiline-static"
                            sx={{ width: 211 }}
                            multiline
                            rows={10}
                            placeholder={validGeneSymbols ? "Paste gene symbols here" : "Paste set identifiers here"}
                            value={genesetInfo ? genesetInfo.genes : ''}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenesetInfo(genesetInfo ? { ...genesetInfo, genes: event.target.value } : { name: '', genes: event.target.value, description: '', backgroundGenes: '' })
                            }}
                        />}
                        {addBackground && <div className="flex-col my-auto">
                        
                            <TextField
                                id="standard-multiline-static"
                                sx={{ width: 150, "mx": "auto" }}
                                multiline
                                rows={7}
                                placeholder={validGeneSymbols ? "Paste complete list of genes/proteins that were detected in the assay" : "Paste set identifiers here"}
                                value={genesetInfo ? genesetInfo.backgroundGenes : ''}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setGenesetInfo(genesetInfo ? { ...genesetInfo, backgroundGenes: event.target.value } : { name: '', genes: '', description: '', backgroundGenes: event.target.value })
                                }} /> 
                            <Select
                                sx={{ width: 150, mt: 1, zIndex: 1, fontSize: 12 }}
                                labelId="species-select-label"
                                value={precomputedBackground}
                                onChange={handleChange2}
                                color='secondary'
                                MenuProps={MenuProps}>
                                <MenuItem value="custom">Custom</MenuItem>
                                <MenuItem value="protein-coding">Protein-coding genes</MenuItem>
                            </Select>
                            </div>}
                        </div>
                        <Button variant="outlined" color="secondary" onClick={() => {
                            setGenesetInfo(genesetInfo ? { ...genesetInfo, backgroundGenes: ''} : { name: '', genes: '', description: '', backgroundGenes: '' })
                            setConvertedBackgroundSymbols([])
                            setAddBackground(!addBackground)
                        }}> {addBackground ? "Remove Background" : "Add Background"}</Button>
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