'use client'
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, LinearProgress, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { CFDELibraryOptions, GMTSelect } from "./GMTSelect";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridTreeNodeWithRender } from "@mui/x-data-grid";
import React from "react";
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { fetchCrossPairs, generateHypothesis } from "@/app/gmt-cross/[id]/GMTCrossFunctions";
import CircularIndeterminate from "@/components/misc/Loading";
import { copyToClipboard } from "@/components/assemble/DCCFetch/CFDEDataTable";
import { CFDECrossPair } from "@prisma/client";
import { enrich } from "@/app/analyze/[id]/ViewGenesBtn";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DownloadIcon from '@mui/icons-material/Download';
import { addMultipleSetsToSessionCross, addToSessionSets, checkInSession } from "@/app/assemble/[id]/AssembleFunctions ";
import { addStatus } from "@/components/assemble/fileUpload/SingleUpload";
import { useParams } from "next/navigation";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import Status from "@/components/assemble/Status";

const RenderOverlapButton = ({ params, sessionId }: { params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>, sessionId: string }) => {
    const [open, setOpen] = React.useState(false);
    const [status, setStatus] = React.useState<addStatus>({})

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const copyClipboardFunc = React.useCallback(() => {
        copyToClipboard(params.row.overlap.join('\n').replaceAll("'", ""))
    }, [params.row.overlappingGenes, params.row.overlap])
    return (
        <React.Fragment>
            <Button
                color="tertiary"
                size="small"
                style={{ textDecoration: 'underline' }}
                onClick={(event) => { event.stopPropagation(); handleOpen() }}>
                {params.row.n_overlap}
            </Button>
            <Dialog
                onClose={handleClose}
                open={open}>
                <DialogTitle>{params.row.geneset_1 + ' ∩ ' + params.row.geneset_2}</DialogTitle>
                <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
                    <Grid item>
                        {/* <Typography variant='body1' color='secondary'> {params.row.genes.length} genes</Typography> */}
                        <Typography variant='body1' color='secondary'> {params.row.n_overlap} genes found</Typography>
                    </Grid>
                    <Grid item>
                        <TextField
                            id="standard-multiline-static"
                            multiline
                            rows={10}
                            value={params.row.overlap.toString().replaceAll(',', '\n').replaceAll("'", '')}
                            disabled
                        />
                    </Grid>
                    <Grid item container spacing={1} sx={{ mt: 2 }} justifyContent="center" alignItems={'center'}>
                        <Grid item>
                            <Button variant='contained' color='primary' onClick={(event) => copyClipboardFunc()}>
                                COPY TO CLIPBOARD
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant='contained' color='primary'
                                onClick={(evt) => {
                                    enrich({ list: params.row.overlap.join('\n').replaceAll("'", "") || '', description: params.row.geneset_1 + ' Intersection ' + params.row.geneset_2 })
                                }}
                            >
                                SEND TO ENRICHR
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant='contained' color='primary'
                                onClick={(evt) => {
                                    const genesetName = params.row.geneset_1 + ' Intersection ' + params.row.geneset_2
                                    checkInSession(sessionId, genesetName).then((response) => {
                                        if (response) {
                                            setStatus({ error: { selected: true, message: "Gene set already exists in this session!" } })
                                        } else {
                                            addToSessionSets(params.row.overlap.toString().replaceAll("'", '').split(','), sessionId, genesetName, '').then((result) => { setStatus({ success: true }) }).catch((err) => setStatus({ error: { selected: true, message: "Error in adding gene set!" } }))
                                        }
                                    })

                                    // enrich({ list: params.row.overlap.join('\n').replaceAll("'", "") || '', description: params.row.geneset_1 + ' Intersection ' + params.row.geneset_2 })
                                }}
                            >
                                ADD TO CART
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Status status={status} />
                    </Grid>
                </Grid>
            </Dialog>
        </React.Fragment>
    )
}


type hypothesisDisplay = {
    geneset1: string,
    geneset2: string,
    library1: string,
    library2: string,
    hypothesis: string,
    abstract1: string,
    abstract2: string,
    enrichedTerms: string[]
    topEnrichmentResults: { [key: string]: any[] } | null
}


type selectedCrossRowType = {
    id: string,
    lib_1: string,
    lib_2: string,
    geneset_1: string,
    geneset_2: string,
    odds_ratio: number,
    pvalue: number,
    n_overlap: number,
    overlap: string[]
}

const download = (filename: string, text: string) => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


const CFDELibHeaders: { [key: string]: string } = {
    "LINCS_L1000_Chem_Pert_Consensus_Sigs": "LINCS Chemical Pertubations",
    "LINCS_L1000_CRISPR_KO_Consensus_Sigs": "LINCS Genetic Pertubations",
    "GTEx_Tissues": 'GTEX Tissues',
    "GTEx_Aging_Sigs": 'GTEX Aging Signatures',
    "Metabolomics_Workbench_Metabolites": 'Metabolites',
    "IDG_Drug_Targets": 'IDG Drugs',
    "GlyGen_Glycosylated_Proteins": 'Glycans',
    "KOMP2_Mouse_Phenotypes": 'Phenotypes',
    "MoTrPAC": 'MoTrPAC Gene Sets'
}

const CFDE_Lib_Full: { [key: string]: string } = {
    "LINCS_L1000_Chem_Pert_Consensus_Sigs": "LINCS L1000 Chemical Pertubations Consensus Signatures",
    "LINCS_L1000_CRISPR_KO_Consensus_Sigs": "LINCS L1000 CRISPR Knockout Consensus Signatures",
    "GTEx_Tissues": 'GTEx Tissue Gene Expression Profiles',
    "GTEx_Aging_Sigs": 'GTEx Aging Signatures',
    "Metabolomics_Workbench_Metabolites": 'Metabolomics Workbench Metabolites',
    "IDG_Drug_Targets": 'IDG Drug Targets',
    "GlyGen_Glycosylated_Proteins": 'GlyGen Glycosylated Proteins',
    "KOMP2_Mouse_Phenotypes": 'KOMP2 Mouse Phenotypes',
    "MoTrPAC": 'MoTrPAC Rat Endurance Exercise Training'
}

const sortDict = (dict: { [key: string]: number[][] }) => {
    let items : any[] = []
    for (let term of Object.keys(dict)) {
        const termValues = dict[term]
        for (let termOccurence of termValues){
            items.push([term, termOccurence])
        }
    }
    // Sort the array based on the first number in the value (starting index) element
    items.sort(
        (first: any, second: any) => { return first[1][1] - second[1][1] }
    );
    return items
}


const generateHypothesisTooltip = (hypothesisString: string, substringIndices: { [key: string]: number[][] }, topEnrichmentResults: { [key: string]: any[] }) => {
    let prevStart = 0;
    const splittedStrings = [];
    for (let term of sortDict(substringIndices)) {
        let termWords = term[0]
        let termStart = term[1][0]
        let termEnd = term[1][1]
        splittedStrings.push(<Typography display="inline">{hypothesisString.substring(prevStart, termStart)}</Typography>);
        splittedStrings.push(
            <Tooltip title={
                <React.Fragment>
                    <Typography color="inherit"> Enrichment Analysis</Typography>
                    Library: {topEnrichmentResults[termWords][9]}
                    <br></br>
                    Rank: {topEnrichmentResults[termWords][0]}
                    <br></br>
                    P-value: {topEnrichmentResults[termWords][2].toExponential(2)}
                    <br></br>
                    Odds Ratio: {topEnrichmentResults[termWords][3].toFixed(4)}
                </React.Fragment>
            } placement="right" >
                <Typography color='secondary' sx={{ textDecoration: 'underline' }} display="inline">
                    {hypothesisString.substring(termStart, termEnd)}
                </Typography>
            </Tooltip>
        )
        prevStart = termEnd
    }
    splittedStrings.push(<Typography display="inline">{hypothesisString.substring(prevStart)}</Typography>);
    return <React.Fragment>
        {splittedStrings}
    </React.Fragment>
}

export function GMTCrossLayout() {
    const [rows, setRows] = React.useState<CFDECrossPair[]>([])
    const [selectedLibs, setSelectedLibs] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(false)
    const [hypLoading, setHypLoading] = React.useState(false)
    const [hypothesis, setHypothesis] = React.useState<hypothesisDisplay | null>(null)
    const [headers, setHeaders] = React.useState<string[] | null>(null)
    const [rowSelectionModel, setRowSelectionModel] =
        React.useState<GridRowSelectionModel>([]);
    const [selectedRows, setSelectedRows] = React.useState<(selectedCrossRowType | undefined)[]>([])
    const [status, setStatus] = React.useState<addStatus>({})

    const params = useParams<{ id: string }>()
    const sessionId = params.id
    const addSets = React.useCallback(() => {
        addMultipleSetsToSessionCross(selectedRows ? selectedRows : [], sessionId)
            .then((results: any) => {
                if (results.code === 'success') {
                    setStatus({ success: true })
                } else if (results.code === 'error') {
                    setStatus({ error: { selected: true, message: results.message } })
                }
            }).catch((err) => setStatus({ error: { selected: true, message: "Error in adding gene set!" } }))
    }, [selectedRows, sessionId])


    const getCrossData = React.useCallback(() => {
        setHypothesis(null)
        setLoading(true)
        if (selectedLibs.length === 2) {
            fetchCrossPairs(selectedLibs[0], selectedLibs[1]).then((result) => {
                setLoading(false);
                setRows(result);
                setHeaders([CFDELibHeaders[result[0].lib_1], CFDELibHeaders[result[0].lib_2]])
            }).catch((err) => setLoading(false))
        }
    }, [selectedLibs])

    const RenderHypothesisButton = (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        return (
            <React.Fragment>
                <Button
                    color="tertiary"
                    size="small"
                    variant="contained"
                    sx={{ margin: 2 }}
                    onClick={(evt) => {
                        setHypothesis(null)
                        setHypLoading(true)
                        generateHypothesis(params.row).then((response) => {
                            setHypLoading(false);
                            if (response.status === 200) {
                                const hypothesisDisplayObject = {
                                    geneset1: params.row.geneset_1,
                                    geneset2: params.row.geneset_2,
                                    library1: CFDE_Lib_Full[params.row.lib_1],
                                    library2: CFDE_Lib_Full[params.row.lib_2],
                                    hypothesis: response.response.hypothesis,
                                    abstract1: response.response.abstract1,
                                    abstract2: response.response.abstract2,
                                    enrichedTerms: response.response.enrichedTerms,
                                    topEnrichmentResults: response.response.topEnrichmentResults
                                }
                                setHypothesis(hypothesisDisplayObject)
                            }
                        }).catch((err) => { setHypLoading(false); })
                    }}
                >
                    <Typography sx={{ fontSize: 10, textWrap: 'wrap' }}>
                        GPT-4 Hypothesis
                    </Typography>
                </Button>
            </React.Fragment>
        )
    }

    const columns: GridColDef[] = [
        {
            field: 'geneset_1',
            headerName: headers ? headers[0] : 'Geneset 1',
            //   width: 150,
            flex: 1,
            editable: true,
            minWidth: 120
        },
        {
            field: 'geneset_2',
            headerName: headers ? headers[1] : 'Geneset 2',
            //   width: 150,
            flex: 1,
            editable: true,
            minWidth: 120
        },
        {
            field: 'pvalue',
            headerName: 'P-Value',
            //   width: 110,
            flex: 0.5,
            // editable: true,
            minWidth: 100,
            renderCell: (params) => {
                return (params.value.toExponential(2));
            },
        },
        {
            field: 'odds_ratio',
            headerName: 'Odds',
            flex: 0.5,
            minWidth: 100,
            renderCell: (params) => {
                if (params.value === 999999999999999.99) {
                    return 'inf'
                } else {
                    return (params.value.toFixed(4));
                }
            },
            //   width: 160,
        },
        {
            field: 'overlap',
            headerName: 'Overlap',
            flex: 0.3,
            minWidth: 100,
            renderCell: params => {
                return <RenderOverlapButton params={params} sessionId={sessionId} />
            }


            // width: 160,
        },
        {
            field: 'hypothesis',
            headerName: 'Form Hypothesis with GPT-4',
            flex: 0.5,
            minWidth: 100,
            renderCell: RenderHypothesisButton,
            sortable: false,
            editable: false,
            headerClassName: 'super-app-theme--header'
            // width: 160,
        },
    ];

    const enrichedTermsIndices = React.useMemo(() => {
        if (hypothesis) {
            let indices: { [key: string]: number[][] } = {}
            for (let term of hypothesis.enrichedTerms) {
                let startIndex = 0
                while ((hypothesis.hypothesis.indexOf(term, startIndex)) > -1) {
                    let index = hypothesis.hypothesis.indexOf(term, startIndex)
                    let oldTermValues : number [][]; 
                    (term in indices) ? oldTermValues = indices[term] : oldTermValues = []
                    indices[term] = [...oldTermValues, [index, index + term.length]];
                    startIndex = index + term.length;
                }
            }
            return indices
        }
        return null
    }, [hypothesis])


    return (
        <>
            <Stack direction="column" spacing={3} sx={{ marginBottom: 3 }}>
                <Stack direction='row' spacing={2}>
                    <GMTSelect selectedLibs={selectedLibs} setSelectedLibs={setSelectedLibs} index={0} />
                    <GMTSelect selectedLibs={selectedLibs} setSelectedLibs={setSelectedLibs} index={1} />
                </Stack>
                <div className="flex justify-center">
                    <Button variant="contained" color="secondary" onClick={getCrossData}>
                        <ShuffleIcon sx={{ fontsize: 100 }} />
                    </Button>
                    {loading && <CircularIndeterminate />}
                </div>
                {hypothesis !== null &&
                    <Paper elevation={1} sx={{
                        width: '100%',
                        minHeight: '100px'
                    }}>
                        <Stack direction='column' sx={{ padding: 2 }}>
                            <Box justifyContent={'flex-end'}>
                                <Button color="secondary" onClick={(evt) => copyToClipboard(
                                    `geneset 1: ${hypothesis.geneset1} \n
                                geneset 2: ${hypothesis.geneset2} \n
                                library 1: ${hypothesis.library1}\n
                                library 2: ${hypothesis.library2}\n
                                hypothesis:${hypothesis.hypothesis} 
                                `
                                )}><ContentPasteIcon /></Button>
                                <Button color="secondary" onClick={(evt) => {
                                    download('gpt-hypothesis',
                                        `Geneset 1: ${hypothesis.geneset1}\n
                                Geneset 2: ${hypothesis.geneset2}\n
                                Library 1: ${hypothesis.library1}\n
                                Library 2: ${hypothesis.library2}\n
                                Hypothesis:${hypothesis.hypothesis} 
                            `)
                                }}><DownloadIcon /></Button>
                            </Box>
                            <Box>
                                <Typography>
                                    <strong>GENE SET 1: </strong>
                                    <Tooltip title={
                                        <React.Fragment>
                                            <Typography color="inherit"> Abstract for {hypothesis.geneset1}</Typography>
                                            {hypothesis.abstract1}
                                        </React.Fragment>
                                    } placement="right">
                                        <Typography color='secondary' sx={{ textDecoration: 'underline' }} display="inline">
                                            {hypothesis.geneset1}
                                        </Typography>
                                    </Tooltip>
                                </Typography>
                            </Box>
                            <Box>
                                <Typography>
                                    <strong>GENE SET 2: </strong>
                                    <Tooltip title={
                                        <React.Fragment>
                                            <Typography color="inherit"> Abstract for {hypothesis.geneset2}</Typography>
                                            {hypothesis.abstract2}
                                        </React.Fragment>
                                    } placement="right">
                                        <Typography color='secondary' sx={{ textDecoration: 'underline' }} display="inline">
                                            {hypothesis.geneset2}
                                        </Typography>
                                    </Tooltip>
                                </Typography>
                            </Box>
                            <Box><Typography><strong>LIBRARY 1:</strong> {hypothesis.library1}</Typography></Box>
                            <Box><Typography><strong>LIBRARY 2:</strong> {hypothesis.library2}</Typography></Box>
                            <Box>
                                <Typography>
                                    <strong>HYPOTHESIS: </strong>
                                </Typography>
                                {enrichedTermsIndices && hypothesis.topEnrichmentResults && generateHypothesisTooltip(hypothesis.hypothesis, enrichedTermsIndices, hypothesis.topEnrichmentResults)}
                            </Box>
                        </Stack>
                    </Paper>}
                {hypLoading && <Box sx={{ width: '100%' }}>
                    <LinearProgress color="secondary" />
                </Box>}
                {(rows.length > 0) && <div style={{ width: '100%' }}>
                    {selectedRows.length > 0 && <Button color='tertiary' onClick={addSets}> <LibraryAddIcon /> ADD TO CART</Button>}
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                            sorting: {
                                sortModel: [{ field: 'pvalue', sort: 'asc' }],
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        // disableRowSelectionOnClick
                        onRowSelectionModelChange={(newRowSelectionModel) => {
                            setRowSelectionModel(newRowSelectionModel);
                            setSelectedRows(newRowSelectionModel.map((id) => rows.find((row) => row.id === id)))
                        }}
                        rowSelectionModel={rowSelectionModel}
                        checkboxSelection
                        sx={{
                            '.MuiDataGrid-columnHeader': {
                                backgroundColor: '#C9D2E9',
                            },
                            '.MuiDataGrid-columnHeaderTitle': {
                                whiteSpace: 'normal !important',
                                wordWrap: 'break-word !important',
                                lineHeight: "normal",
                            },
                            "& .MuiDataGrid-columnHeader": {
                                // Forced to use important since overriding inline styles
                                height: "unset !important",
                                padding: 1
                            },
                            "& .MuiDataGrid-columnHeaders": {
                                // Forced to use important since overriding inline styles
                                maxHeight: "168px !important"
                            },
                            '.MuiDataGrid-cell': {
                                whiteSpace: 'normal !important',
                                wordWrap: 'break-word !important',
                            },
                            '& .super-app-theme--header': {
                                padding: 2,
                                fontSize: 13,
                            },
                        }}
                    />
                    <Status status={status} />
                </div>}
            </Stack>
        </>
    )
}