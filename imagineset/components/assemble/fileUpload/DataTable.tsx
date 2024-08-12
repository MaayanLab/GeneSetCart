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
import { addMultipleSetsToSession, addToSessionSets, checkValidGenes } from '@/app/assemble/[id]/AssembleFunctions ';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { useParams } from 'next/navigation';
import { addStatus } from './SingleUpload';
import Status from '../Status';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';


export function copyToClipboard(genesString: string) {
  navigator.clipboard.writeText(genesString);
}


function RenderDetailsButton({ params, isHumanGenes }: { params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>, isHumanGenes: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [validGenes, setValidGenes] = React.useState<string[]>([])

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
        sx={{ margin: 1 }}
        onClick={(event) => {
          event.stopPropagation();
            checkValidGenes(params.row.genes.toString().replaceAll(',', '\n'))
              .then((result) => {
                setValidGenes(result);
                handleOpen();
              })
        }}>
        <VisibilityIcon /> &nbsp;
        {'Genes'}
      </Button>
      <Dialog
        onClose={handleClose}
        open={open}>
        <DialogTitle>{params.row.genesetName}</DialogTitle>
        <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
          <Grid item>
            <Typography variant='body1' color='secondary'> {params.row.genes.filter((item: string) => item != '').length} items found</Typography>
            <Typography variant='body1' color='secondary'> {validGenes.length} valid genes found</Typography>
          </Grid>
          <Grid item>
            <TextField
              id="standard-multiline-static"
              multiline
              rows={10}
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





export default function DataTable({ rows, isHumanGenes }: { rows: GMTGenesetInfo[], isHumanGenes: boolean }) {
  const params = useParams<{ id: string }>()
  const [status, setStatus] = React.useState<addStatus>({})
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const [selectedRows, setSelectedRows] = React.useState<(GMTGenesetInfo | undefined)[]>([])

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'genesetName', headerName: isHumanGenes ? 'Gene Set Name' : 'Set Name', width: 500 },
    {
      field: 'genesButton', headerName: isHumanGenes ? 'View Genes' : 'View Set Items', width: 150, renderCell: (params) => {
        return (
          <RenderDetailsButton params={params} isHumanGenes={isHumanGenes} />
        );
      }
    }
  ];

  const addSets = React.useCallback(() => {
    setStatus({ loading: true })
    addMultipleSetsToSession(selectedRows ? selectedRows : [], params.id, isHumanGenes)
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
  }, [selectedRows, params.id, isHumanGenes])



  return (
    <div style={{ height: 400, width: '100%' }}>
      {selectedRows.length > 0 && <Button color='tertiary' variant='contained' onClick={addSets} sx={{ marginBottom: 1 }}> <AddShoppingCartIcon /> &nbsp; ADD TO CART</Button>}
      <DataGrid
        getRowHeight={() => 'auto'}
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
          },
          '.MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700
          },
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