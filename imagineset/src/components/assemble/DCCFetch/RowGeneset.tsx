'use client'
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import {
    Button, Grid, TextField, Typography, useMediaQuery
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { searchResultsType } from './CfdeSearch';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { addToSessionSets, checkValidGenes } from '@/app/assemble/[id]/AssembleFunctions ';
import { useParams } from 'next/navigation';
import { addStatus } from '../fileUpload/SingleUpload';

export function AddGenesetButton({ resultItem, setStatus }: {
    resultItem: searchResultsType,
    setStatus: React.Dispatch<React.SetStateAction<addStatus>>
}) {
    const params = useParams<{ id: string }>()
    const addGeneset = React.useCallback((
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        fetch('https://maayanlab.cloud/Enrichr/geneSetLibrary?' + new URLSearchParams(`libraryName=${resultItem.libraryName}&term=${resultItem.genesetName}&mode=json`))
            .then((response) => response.json()
                .then((data) => {
                    const genes = data[resultItem.genesetName]
                    const sessionId = params.id
                    checkValidGenes(genes.toString().substring(1, genes.toString().length).replaceAll(',', '\n'))
                        .then((validGenes) => {
                            addToSessionSets(validGenes, sessionId, resultItem.genesetName, '')
                            .then((result) => setStatus({ success: true }))
                        })
                }))
    }, [])

    return (
        <Button color="secondary" onClick={addGeneset}>
            <LibraryAddIcon />
        </Button>
    )
}

export function GenesetDialogBox({ resultItem }: {
    resultItem: searchResultsType
}) {
    const [open, setOpen] = React.useState(false);
    const [genes, setGenes] = React.useState<string[]>([])
    const [validGenes, setValidGenes] = React.useState<string[]>([])
    const getGenes = React.useCallback((
        resultItem: searchResultsType,
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        fetch('https://maayanlab.cloud/Enrichr/geneSetLibrary?' + new URLSearchParams(`libraryName=${resultItem.libraryName}&term=${resultItem.genesetName}&mode=json`))
            .then((response) => response.json()
                .then((data) => {

                    setGenes(data[resultItem.genesetName])
                    setOpen(true);
                }))
    }, [])

    React.useEffect(() => {
        checkValidGenes(genes.toString().substring(1, genes.toString().length).replaceAll(',', '\n')).then((response) => setValidGenes(response))
    }, [genes])



    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button color='secondary' variant="contained" onClick={(event) => { getGenes(resultItem, event) }}>
                <VisibilityIcon />
                Genes
            </Button>
            <Dialog
                onClose={handleClose}
                open={open}>
                <DialogTitle>{resultItem.genesetName}</DialogTitle>
                <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
                    <Grid item>
                        <Typography variant='body1' color='secondary'> {validGenes.length} valid genes</Typography>
                    </Grid>
                    <Grid item>
                        <TextField
                            id="standard-multiline-static"
                            multiline
                            rows={10}
                            placeholder="Paste gene symbols here"
                            value={genes.toString().substring(1, genes.toString().length).replaceAll(',', '\n')}
                            disabled
                        />
                    </Grid>
                    <Grid item sx={{ mt: 2 }}>
                        <Button variant='contained' color='primary'>
                            COPY TO CLIPBOARD
                        </Button>
                    </Grid>
                </Grid>
            </Dialog>
        </React.Fragment>

    );
}
