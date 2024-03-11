'use client'
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { CFDELibraryOptions, GMTSelect } from "./GMTSelect";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridTreeNodeWithRender } from "@mui/x-data-grid";
import React from "react";
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { fetchCrossPairs, generateHypothesis } from "@/app/gmt-cross/[id]/GMTCrossFunctions";
import CircularIndeterminate from "@/components/misc/Loading";
import { copyToClipboard } from "@/components/assemble/DCCFetch/CFDEDataTable";
import { CFDECrossPair } from "@prisma/client";
import { enrich } from "@/app/analyze/[id]/ViewGenesBtn";
import CloseIcon from '@mui/icons-material/Close';


const RenderOverlapButton = (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const copyClipboardFunc = React.useCallback(() => {
        console.log(params)
        copyToClipboard(params.row.overlap.join('\n').replaceAll("'", ""))
    }, [params.row.overlappingGenes])
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


                    </Grid>
                </Grid>
            </Dialog>
        </React.Fragment>
    )
}




export function GMTCrossLayout() {
    const [rows, setRows] = React.useState<CFDECrossPair[]>([])
    const [selectedLibs, setSelectedLibs] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(false)
    const [hypLoading, setHypLoading] = React.useState(false)
    const [hypothesis, setHypothesis] = React.useState('')

    const [open, setOpen] = React.useState(false)

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const getCrossData = React.useCallback(() => {
        setLoading(true)
        if (selectedLibs.length === 2) {
            fetchCrossPairs(selectedLibs[0], selectedLibs[1]).then((result) => { setLoading(false); setRows(result) }).catch((err) => setLoading(false))
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
                    // onClick={(evt) => {
                    //     setHypothesis('')
                    //     setHypLoading(true)
                    //     generateHypothesis(params.row).then((response) => { setHypLoading(false); if (typeof (response) === 'string') { setHypothesis(response) } }).catch((err) => { setHypLoading(false); })
                    // }}
                    onClick={handleClickOpen}
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
            headerName: 'Geneset 1',
            //   width: 150,
            flex: 1,
            editable: true,
            minWidth: 120
        },
        {
            field: 'geneset_2',
            headerName: 'Geneset 2',
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
                return (params.value.toFixed(4));
            },
            //   width: 160,
        },
        {
            field: 'overlap',
            headerName: 'Overlap',
            flex: 0.3,
            minWidth: 100,
            renderCell: RenderOverlapButton
            // width: 160,
        },
        {
            field: 'hypothesis',
            headerName: 'Form Hypothesis with GPT-4',
            flex: 0.5,
            minWidth: 100,
            renderCell: RenderHypothesisButton,
            sortable: false,
            editable: false
            // width: 160,
        },
    ];


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
                {(rows.length > 0) && <div style={{ width: '100%' }}>
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
                        disableRowSelectionOnClick
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
                        }}
                    />
                </div>}
                {hypLoading && <Box sx={{ width: '100%' }}>
                    <LinearProgress color="secondary" />
                </Box>}
                {(hypothesis.length > 0) && <TextField
                    multiline
                    value={hypothesis}
                    rows={10}
                >
                </TextField>}
            </Stack>
            <Dialog
                onClose={handleClose}
                open={open}>
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    FEATURE COMING SOON
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent >
                    The GPT-generated hypothesis functionality is coming soon!
                </DialogContent>
            </Dialog>
        </>
    )
}