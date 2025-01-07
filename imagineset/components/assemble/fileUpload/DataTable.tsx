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
import { addMultipleSetsToSession, addToSessionSets, checkValidGenes, convertGeneSpecies } from '@/app/assemble/[id]/AssembleFunctions';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { useParams } from 'next/navigation';
import { addStatus } from './SingleUpload';
import Status from '../Status';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';


export function copyToClipboard(genesString: string) {
  navigator.clipboard.writeText(genesString);
}


function RenderDetailsButton({ params, species, validGeneSymbols }: { params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>, species: string, validGeneSymbols: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [validGenes, setValidGenes] = React.useState<string[]>([])
  const [geneValidation, setGeneValidation] = React.useState(false)

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
          if (validGeneSymbols) {
            convertGeneSpecies(params.row.genes.toString().replaceAll(',', '\n'), species).then((result) => setValidGenes(result))
            handleOpen();
          }
          else handleOpen();
        }}>
        <VisibilityIcon /> &nbsp;
        {'Genes'}
      </Button>
      <Dialog
        onClose={handleClose}
        open={open}>
        <DialogTitle>{params.row.genesetName}</DialogTitle>
        <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
          <Grid item gap={3} marginBottom={2}>
            <Typography variant='body1' color='secondary'> {params.row.genes.filter((item: string) => item != '').length} items found</Typography>
            {validGeneSymbols &&
            <Button variant="contained" onClick={() => setGeneValidation(true)}><Typography variant='body1' color='secondary'> {validGenes.filter((g) => g).length} valid genes found</Typography></Button>}
          </Grid>
          <Grid item>
          {geneValidation ? 
            <div onClick={() => setGeneValidation(false)}
              style={{ overflow: 'scroll', height: '263px', width: '211px', padding: 10, border: '1px solid darkblue', borderRadius: '5px' }}>
                {params.row.genes.map((gene: string, index: number) => (
                    <span key={index} style={{ color: validGenes[index] ? 'green' : 'red' }}>
                        {gene == validGenes[index] ? <>{gene}&#x2713;</> : <>{validGenes[index] ? <>{gene}&rarr;{validGenes[index]}</> : <>{gene}&#x2715;</> }</>}
                        {index < params.row.genes.length - 1 && <br />}
                    </span>
                ))}
            </div>
            : 
            <TextField
              id="standard-multiline-static"
              multiline
              rows={10}
              value={params.row.genes.toString().replaceAll(',', '\n')}
              disabled
          />}
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





export default function DataTable({ rows, species, validGeneSymbols, isHumanGenes }: { rows: GMTGenesetInfo[], species: string, validGeneSymbols: boolean, isHumanGenes: boolean }) {
  const params = useParams<{ id: string }>()
  const [status, setStatus] = React.useState<addStatus>({})
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);
  const [selectedRows, setSelectedRows] = React.useState<(GMTGenesetInfo | undefined)[]>([])

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'genesetName', headerName: validGeneSymbols ? 'Gene Set Name' : 'Set Name', width: 500 },
    {
      field: 'genesButton', headerName: validGeneSymbols ? 'View Genes' : 'View Set Items', width: 150, renderCell: (params) => {
        return (
          <RenderDetailsButton params={params} species={species} validGeneSymbols={validGeneSymbols} />
        );
      }
    }
  ];

  const addSets = React.useCallback(() => {
    setStatus({ loading: true })
    //TODO: UPDATE FUNCTION FOR MULTIPLE SPECIES
    addMultipleSetsToSession(selectedRows ? selectedRows : [], params.id, validGeneSymbols, species, isHumanGenes)
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
  }, [selectedRows, params.id, validGeneSymbols])



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