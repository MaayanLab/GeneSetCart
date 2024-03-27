'use client'
import * as React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import {
  Grid, TextField, Typography, useMediaQuery
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { addMultipleSetsCFDE, checkValidGenes } from '@/app/assemble/[id]/AssembleFunctions ';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { useParams } from 'next/navigation';
import Status from '../Status';
import { searchResultsType } from './DCCUpload';
import { addStatus } from '../fileUpload/SingleUpload';

export function copyToClipboard(genesString: string) {
  navigator.clipboard.writeText(genesString);
}


const RenderDetailsButton = (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
  const [open, setOpen] = React.useState(false);
  const [validGenes, setValidGenes] = React.useState<string[]>([])
  React.useEffect(() => {
    fetch('https://maayanlab.cloud/Enrichr/geneSetLibrary?' + new URLSearchParams(`libraryName=${params.row.libraryName}&term=${params.row.genesetName}&mode=json`))
      .then((response) => response.json())
      .then((responsejson) => checkValidGenes(responsejson[params.row.genesetName].toString().replaceAll(',', '\n'))
        .then((result) => setValidGenes(result)))
  }, [params.row.genes])


  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        color="tertiary"
        size="small"
        onClick={(event) => { event.stopPropagation(); handleOpen() }}>
        <VisibilityIcon /> &nbsp;
        Genes
      </Button>
      <Dialog
        onClose={handleClose}
        open={open}>
        <DialogTitle>{params.row.genesetName}</DialogTitle>
        <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
          <Grid item>
            {/* <Typography variant='body1' color='secondary'> {params.row.genes.length} genes</Typography> */}
            <Typography variant='body1' color='secondary'> {validGenes.length} valid genes found</Typography>
          </Grid>
          <Grid item>
            <TextField
              id="standard-multiline-static"
              multiline
              rows={10}
              value={validGenes.toString().replaceAll(',', '\n')}
              disabled
            />
          </Grid>
          <Grid item sx={{ mt: 2 }}>
            <Button variant='contained' color='primary' onClick={(event) => copyToClipboard(params.row.genes.toString().replaceAll(',', '\n'))}>
              COPY TO CLIPBOARD
            </Button>
          </Grid>
        </Grid>
      </Dialog>
    </React.Fragment>
  )
}


const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 50 },
  { field: 'dcc', headerName: 'DCC', width: 100 },
  { field: 'genesetName', headerName: 'Gene set name', width: 350 },
  { field: 'genesButton', headerName: 'View Genes', width: 150, renderCell: RenderDetailsButton, }
];


export default function CFDEDataTable({ rows }: { rows: searchResultsType[] }) {
  const params = useParams<{ id: string }>()
  const [status, setStatus] = React.useState<addStatus>({})
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  const [selectedRows, setSelectedRows] = React.useState<(searchResultsType | undefined)[]>([])

  const addSets = React.useCallback(() => {
    setStatus({ loading: true })
    addMultipleSetsCFDE(selectedRows ? selectedRows : [], params.id)
      .then((results: any) => {
        if (results.code === 'success') {
          setStatus({ success: true })
        } else if (results.code === 'error') {
          setStatus({ error: { selected: true, message: results.message } })
        }
      }).catch((err) => {
        if (err.message === 'No valid genes in gene set') {
          setStatus({ error: { selected: true, message: err.message } })
      } else {
          setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
      }
      })
  }, [selectedRows, params.id])

  return (
    <div style={{ height: 400, width: '100%' }}>
      {selectedRows.length > 0 && <Button color='tertiary' onClick={addSets}> <LibraryAddIcon /> ADD TO CART</Button>}
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{
          '.MuiDataGrid-columnHeader': {
            backgroundColor: '#C9D2E9',
          },
          '.MuiDataGrid-cell': {
            whiteSpace: 'normal !important',
            wordWrap: 'break-word !important',
          }
        }}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
          setSelectedRows(newRowSelectionModel.map((id) => rows.find((row) => row.id === id)))
        }}
        rowSelectionModel={rowSelectionModel}
      />
      <Status status={status} />
    </div>

  );
}