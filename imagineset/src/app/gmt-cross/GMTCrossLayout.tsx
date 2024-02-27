'use client'
import { Button, Dialog, DialogTitle, Grid, Stack, TextField, Typography } from "@mui/material";
import { CFDELibraryOptions, GMTSelect } from "./GMTSelect";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridTreeNodeWithRender } from "@mui/x-data-grid";
import React from "react";
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { CrossPairs, PairsData, fetchCrossPairs } from "@/app/gmt-cross/GMTCrossFunctions";
import CircularIndeterminate from "../../components/misc/Loading";
import { copyToClipboard } from "../../components/assemble/DCCFetch/CFDEDataTable";
import { CFDECrossPair } from "@prisma/client";

type GMTGeneSet = {
    name: string
    library: string
    genes: string[]
    header: string
}

const GeneSetHeaderMap: { [key: string]: string } = {
    "LINCS_L1000_Chem_Pert_Consensus_Sigs": "Pertubation ",
    "LINCS_L1000_CRISPR_KO_Consensus_Sigs": 'LINCS L1000 CMAP CRISPR Knockout Consensus Signatures',
    "GTEx_Tissues_V8_2023": 'GTEx Tissue Gene Expression Profiles',
    "GTEx_Aging_Signatures_2021": 'GTEx Tissue-Specific Aging Signatures',
    "Metabolomics_Workbench_Metabolites_2022": 'Metabolomics Gene-Metabolite Associations',
    "IDG_Drug_Targets_2022": 'IDG Drug Targets',
    "GlyGen_Glycosylated_Proteins_2022": 'Glygen Glycosylated Proteins',
    "KOMP2_Mouse_Phenotypes_2022": 'KOMP2 Mouse Phenotypes',
    // "HuBMAP_ASCTplusB_augmented_2022": 'HuBMAP Anatomical Structures, Cell Types, and Biomarkers (ASCT+B)',
    "MoTrPAC_2023": 'MoTrPAC Rat Endurance Exercise Training'
}


const renderOverlapButton = (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
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
                style={{ marginLeft: 16, textDecoration: 'underline' }}
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
        headerName: 'p-Value',
        //   width: 110,
        flex: 0.6,
        editable: true,
        minWidth: 100,
        renderCell: (params) => {
            return (params.value.toExponential(2));
        },
    },
    {
        field: 'odds_ratio',
        headerName: 'Odds Ratio',
        flex: 0.6,
        minWidth: 100,
        renderCell: (params) => {
            return (params.value.toFixed(4));
        },
        //   width: 160,
    },
    {
        field: 'overlap',
        headerName: 'Overlapping Genes',
        flex: 0.6,
        minWidth: 100,
        renderCell: renderOverlapButton
        // width: 160,
    },
];

export function GMTCrossLayout() {
    const [rows, setRows] = React.useState<CFDECrossPair[]>([])
    const [selectedLibs, setSelectedLibs] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(false)

    const getCrossData = React.useCallback(() => {
        setLoading(true)
        if (selectedLibs.length === 2) {
            // const libName1 = Object.keys(CFDELibraryOptions)[Object.values(CFDELibraryOptions).indexOf(selectedLibs[0])]
            // const libName2 = Object.keys(CFDELibraryOptions)[Object.values(CFDELibraryOptions).indexOf(selectedLibs[1])]
            // CrossPairs(libName1, libName2).then((result) => { setLoading(false); setRows(result) }).catch((err) => setLoading(false))
            fetchCrossPairs(selectedLibs[0], selectedLibs[1]).then((result) => { setLoading(false); console.log(result); setRows(result) }).catch((err) => setLoading(false))
        }
    }, [selectedLibs])



    return (
        <Stack direction="column" spacing={3}>
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
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                        sorting: {
                            sortModel: [{ field: 'jIndex', sort: 'desc' }],
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    sx={{
                        '.MuiDataGrid-columnHeader': {
                            backgroundColor: '#C9D2E9',
                        },
                    }}
                />
            </div>
        </Stack>
    )
}