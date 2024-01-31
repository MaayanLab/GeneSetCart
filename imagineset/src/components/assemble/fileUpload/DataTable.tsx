'use client'
import * as React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { GMTGenesetInfo } from './MultipleUpload';
import { Button } from '@mui/material';
import {
  Grid, TextField, Typography, useMediaQuery
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { addToSessionSets, checkValidGenes } from '@/app/assemble/[id]/AssembleFunctions ';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { useParams } from 'next/navigation';
import { addStatus } from './SingleUpload';
import Status from '../Status';

export function copyToClipboard(genesString: string) {
  navigator.clipboard.writeText(genesString);
}


const renderDetailsButton = (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
  const [open, setOpen] = React.useState(false);
  const [validGenes, setValidGenes] = React.useState<string[]>([])

  React.useEffect(() => {
    checkValidGenes(params.row.genes.toString().replaceAll(',', '\n'))
      .then((result) => setValidGenes(result))
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
        style={{ marginLeft: 16 }}
        onClick={(event) => { event.stopPropagation(); handleOpen() }}>
        <VisibilityIcon />
        Genes
      </Button>
      <Dialog
        onClose={handleClose}
        open={open}>
        <DialogTitle>{params.row.genesetName}</DialogTitle>
        <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
          <Grid item>
            <Typography variant='body1' color='secondary'> {params.row.genes.length} genes found</Typography>
            <Typography variant='body1' color='secondary'> {validGenes.length} valid genes</Typography>
          </Grid>
          <Grid item>
            <TextField
              id="standard-multiline-static"
              multiline
              rows={10}
              placeholder="Paste gene symbols here"
              value={params.row.genes.toString().replaceAll(',', '\n')}
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
  { field: 'id', headerName: 'ID', width: 50 },
  { field: 'genesetName', headerName: 'Gene set name', width: 500 },
  { field: 'genesButton', headerName: 'View Genes', width: 150, renderCell: renderDetailsButton, }
];


export default function DataTable({ rows }: { rows: GMTGenesetInfo[] }) {
  const params = useParams<{ id: string }>()
  const [status, setStatus] = React.useState<addStatus>({})
  const [rowSelectionModel, setRowSelectionModel] =
  React.useState<GridRowSelectionModel>([]);

  const selectedRows = React.useMemo(() => {
    return rowSelectionModel.map((id) => rows.find((row) => row.id === id))
  }, [rowSelectionModel])
  
  // TODO: Fix this
  const addSets = React.useCallback(() => {
    selectedRows.forEach((row) => {
      if (row) {
        checkValidGenes(row.genes.toString().replaceAll(',', '\n') )
        .then((result) =>  addToSessionSets(result, params.id, row.genesetName, ''))
      }
    })
    setStatus({success: true})
  }, [])


  return (
    <div style={{ height: 400, width: '100%' }}>
      {selectedRows.length > 0 && <Button color='tertiary' onClick={addSets}> <LibraryAddIcon/> Add to List</Button>}
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
        }}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
      />
      <Status status={status} />
    </div>
    
  );
}