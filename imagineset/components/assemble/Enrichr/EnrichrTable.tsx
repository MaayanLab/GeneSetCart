'use client'
import * as React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { Button, Stack } from '@mui/material';
import {
  Grid, TextField, Typography, useMediaQuery
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { addMultipleSetsToSession, checkValidGenes } from '@/app/assemble/[id]/AssembleFunctions';
import { useParams } from 'next/navigation';
import Status from '../Status';
import { addStatus } from '../fileUpload/SingleUpload';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { searchResultsType } from './EnrichrLayout';


export function copyToClipboard(genesString: string) {
  navigator.clipboard.writeText(genesString);
}

async function getEnrichrGenes(libraryName : string, genesetName : string) {
    const genesResponse = await fetch(`https://maayanlab.cloud/Enrichr/geneSetLibrary?libraryName=${libraryName}&term=${genesetName}&mode=json`)
    if (genesResponse.ok) {
        const genesJSON = await genesResponse.json()
        const genes = genesJSON[genesetName]
        const validGenes = await checkValidGenes(genes.join('\n'))
        return validGenes
    } else {
        return []
    }

}

const RenderDetailsButton = (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
  const [open, setOpen] = React.useState(false);
  const [validGenes, setValidGenes] = React.useState<string[]>([])

  React.useEffect(() => {
    getEnrichrGenes(params.row.libraryName, params.row.genesetName).then((genes) =>  setValidGenes(genes))
  }, [])


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
            <Button variant='contained' color='primary' onClick={(event) => copyToClipboard(validGenes.join('\n'))}>
              COPY TO CLIPBOARD
            </Button>
          </Grid>
        </Grid>
      </Dialog>
    </React.Fragment>
  )
}


const columns: GridColDef[] = [
  { field: 'genesetName', headerName: 'Gene Set Name', width: 250 },
  { field: 'libraryName', headerName: 'Library', width: 200 },
  { field: 'genesButton', headerName: 'View Genes', width: 150, renderCell: RenderDetailsButton, }
];


export default function EnrichrTable({ rows }: { rows: searchResultsType[] }) {
  const params = useParams<{ id: string }>()
  const [status, setStatus] = React.useState<addStatus>({})
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  const [selectedRows, setSelectedRows] = React.useState<(searchResultsType | undefined)[]>([])

  const addSets = React.useCallback(async () => {
    setStatus({ loading: true })
    const mappedRows = await Promise.all(selectedRows.map(async (row) => {
        if (row !== undefined) {
            const genes = await getEnrichrGenes(row.libraryName, row.genesetName)
            return {...row, genes: genes}
        }
        return undefined
        
    }))
    addMultipleSetsToSession(mappedRows ? mappedRows : [], params.id, true, 'Mammalia/Homo_sapiens', true, null)
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
    <Stack direction='column' spacing={6}>
      <div style={{ minHeight: 200, width: '100%' }}>
        {selectedRows.length > 0 && <Button color='tertiary' onClick={addSets}> <AddShoppingCartIcon /> &nbsp; ADD TO CART</Button>}
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
      </div>
      <div style={{ width: '100%' }}>
        <Status status={status} />
      </div>
    </Stack>
  );
}