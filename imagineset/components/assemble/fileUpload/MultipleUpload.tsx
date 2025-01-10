'use client'
import React from "react";
import { Button, Container, Stack, Typography, useMediaQuery, useTheme, 
        FormControlLabel, Checkbox, Tooltip, Chip, FormControl, InputLabel, 
        Select, MenuItem, SelectChangeEvent, Grid, TextField } from "@mui/material";
import DataTable from "./DataTable";
import { getPrivateSession } from "./getSessionPrivate";
import {getGeneBackgrounds} from "../../../app/assemble/[id]/AssembleFunctions";
import { useParams } from "next/navigation";

export type GMTGenesetInfo = {
    id: number,
    genesetName: string,
    genes: string[]
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

export default function MultipleUpload() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [species, setSpecies] = React.useState('Mammalia/Homo_sapiens')
    const [gmtGenesets, setGmtGenesets] = React.useState<GMTGenesetInfo[]>([])
    const isHumanGenes = React.useMemo(() => species == 'Mammalia/Homo_sapiens', [species])
    const [validGeneSymbols, setValidGeneSymbols] = React.useState(true)
    const params = useParams<{ id: string }>()
    const [privateSession, setPrivateSession] = React.useState(false)
    const [addBackground, setAddBackground] = React.useState(false)
    const [backgroundGenes, setBackgroundGenes] = React.useState('')
    const [precomputedBackground, setPrecomputedBackground] = React.useState('custom')

    React.useEffect(() => {
        getPrivateSession(params.id).then((response: boolean | null) => {
            if (response) {
                setPrivateSession(response)
            }
        })
    }, [])

    const readGMTFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (fileList) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    if (reader.result) {
                        const genesets = reader.result.toString()
                            .split('\n')
                            .map((row, i) => { return { id: i, genesetName: row.split('\t', 1)[0], genes: row.split('\t').slice(2) } })
                        const filteredGenesets = genesets.filter((set) => set.genesetName !== '' || set.genes.length !== 0)
                        setGmtGenesets(filteredGenesets)
                    }
                },
                false,
            );

            if (fileList[0]) {
                reader.readAsText(fileList[0]);
            }
        }
    }

    const handleChange = (event: SelectChangeEvent) => {
        setSpecies(event.target.value as string);
    };

    const handleChange2 = (event: SelectChangeEvent) => {
        setPrecomputedBackground(event.target.value as string);
        if (event.target.value === 'protein-coding' || event.target.value === 'all-genes') {
            getGeneBackgrounds(event.target.value, species).then((response) => {
                setBackgroundGenes(response.join('\n') || '')
            })
        } else if (event.target.value === 'custom') {
            setBackgroundGenes('')
        }
    };


    return (
        <Container>
            <div className='flex items-center'>
            <Typography variant="h3" color="secondary.dark" className='p-5'>UPLOAD MULTIPLE GENE SETS</Typography>
                <Tooltip title={`Current session is ${privateSession ? 'private' : 'public'}`}>
                    <Chip label={privateSession ? 'Private' : 'Public'} variant="outlined" />
                </Tooltip>
            </div>
            <Typography variant="subtitle1" color="#666666" sx={{ ml: 2 }}>
                    Upload an XMT file containing your sets
                </Typography>
            <div className="flex justify-center">
                
                <Stack direction="column" spacing={1} justifyContent="center" alignItems="center">
                <Grid justifyItems='center' alignItems={'center'} justifyContent={'center'}>
                <FormControlLabel control={<Checkbox checked={validGeneSymbols} onChange={(event) => {
                        setValidGeneSymbols(event.target.checked);
                    }} />} label="Only accept valid gene symbols"
                    />
                {validGeneSymbols &&
                <>
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
                </FormControl>
                <div className="mt-1.5 ml-2 inline-flex">
                <Button variant="outlined" color="secondary" onClick={() => {
                            setBackgroundGenes([])
                            //setConvertedBackgroundSymbols([])
                            setAddBackground(!addBackground)
                        }}> {addBackground ? "Remove Background" : "Add Background"}</Button>
                </div>
                </>}
                {addBackground && <div className="flex-col my-auto place-items-center mt-2">
                        
                        <TextField
                            id="standard-multiline-static"
                            sx={{ width: 150, "mx": "auto" }}
                            multiline
                            rows={7}
                            placeholder={validGeneSymbols ? "Paste complete list of genes/proteins that were detected in the assay" : "Paste set identifiers here"}
                            value={backgroundGenes}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setBackgroundGenes(event.target.value )
                            }} /> 
                        <Select
                            sx={{ width: 150, mt: 1, zIndex: 1, fontSize: 12, mt: 10, ml: 1}}
                            labelId="species-select-label"
                            value={precomputedBackground}
                            onChange={handleChange2}
                            color='secondary'
                            MenuProps={MenuProps}>
                            <MenuItem value="custom">Custom</MenuItem>
                            <MenuItem value="protein-coding">Protein-coding genes</MenuItem>
                        </Select>
                </div>}
                
                </Grid>
                    <Button
                        variant="outlined"
                        component="label"
                        color="secondary"
                        sx={{ mt: 3 }}
                    >
                        UPLOAD .XMT FILE
                        <input
                            type="file"
                            hidden
                            onChange={readGMTFile}
                        />
                    </Button>
                </Stack>

            </div>
            <div style={{ height: 600, width: '100%' }} className="mt-2">
                <DataTable rows={gmtGenesets} species={species} validGeneSymbols={validGeneSymbols} isHumanGenes={isHumanGenes} backgroundGenes={backgroundGenes} />
            </div>
        </Container>
    )
}