'use client'
import { Box, Button, Dialog, DialogTitle, Grid, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { CFDELibraryOptions, GMTSelect } from "./GMTSelect";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridTreeNodeWithRender } from "@mui/x-data-grid";
import React from "react";
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { fetchCrossPairs, generateHypothesis } from "@/app/gmt-cross/[id]/GMTCrossFunctions";
import CircularIndeterminate from "@/components/misc/Loading";
import { copyToClipboard } from "@/components/assemble/DCCFetch/CFDEDataTable";
import { CFDECrossPair } from "@prisma/client";


const RenderOverlapButton = (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

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
                <DialogTitle>{params.row.geneset_1 + '∩' + params.row.geneset_2}</DialogTitle>
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
                    <Grid item sx={{ mt: 2 }}>
                        <Button variant='contained' color='primary' onClick={(event) => copyToClipboard(params.row.overlappingGenes.toString().replaceAll(',', '\n'))}>
                            COPY TO CLIPBOARD
                        </Button>
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

    const getCrossData = React.useCallback(() => {
        setLoading(true)
        if (selectedLibs.length === 2) {
            // const libName1 = Object.keys(CFDELibraryOptions)[Object.values(CFDELibraryOptions).indexOf(selectedLibs[0])]
            // const libName2 = Object.keys(CFDELibraryOptions)[Object.values(CFDELibraryOptions).indexOf(selectedLibs[1])]
            // CrossPairs(libName1, libName2).then((result) => { setLoading(false); setRows(result) }).catch((err) => setLoading(false))
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
                    onClick={(evt) => {
                        setHypothesis('')
                        setHypLoading(true)
                        generateHypothesis(params.row).then((response) => {setHypLoading(false); if (typeof (response) === 'string') { setHypothesis(response) } }).catch((err) => {setHypLoading(false);})
                    }}
                >
                    GPT-4 Hypotheis
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
            minWidth: 150
        },
        {
            field: 'geneset_2',
            headerName: 'Geneset 2',
            //   width: 150,
            flex: 1,
            editable: true,
            minWidth: 150
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
            headerName: '',
            flex: 0.5,
            minWidth: 100,
            renderCell: RenderHypothesisButton
            // width: 160,
        },
    ];


    return (
        <Stack direction="column" spacing={3} sx={{marginBottom: 3}}>
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
                    }}
                />
            </div>}
            {hypLoading && <Box sx={{ width: '100%' }}>
                <LinearProgress color="secondary" />
            </Box>}
            {(hypothesis.length > 0) && <TextField
                multiline
                value={hypothesis}
                rows={8}
                >
            </TextField>}
        </Stack>
    )
}