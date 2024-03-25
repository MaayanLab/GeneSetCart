'use client'
import React, { useEffect } from "react";
import {
    Box, Button, Container,
    FormControl, Grid, InputLabel,
    MenuItem, Select, Stack, TextField,
    Typography, useMediaQuery,
    useTheme
} from "@mui/material";
import { addToSessionSets, checkInSession, checkValidGenes, loadTxtExample } from "../../../app/assemble/[id]/AssembleFunctions ";
import { useParams } from "next/navigation";
import Status from "../Status";

export type addStatus = {
    success?: boolean,
    loading?: boolean,
    error?: {
      selected: boolean;
      message: string
    },
  }


export default function SingleUpload() {
    const theme = useTheme();
    const params = useParams<{ id: string }>()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [genes, setGenes] = React.useState('')
    const [validGenes, setValidGenes] = React.useState<string[]>([])
    const  [status, setStatus] = React.useState<addStatus>({})


    const getExample = () => {
        loadTxtExample().then((response) => setGenes(response));
    }

    const downloadExample = React.useCallback(() => {
        loadTxtExample().then((response) => {
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(response));
            element.setAttribute('download', 'example.txt');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        })
    }, []) 

    const readFile = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (fileList) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    if (reader.result) {
                        setGenes(reader.result.toString());
                    }
                },
                false,
            );

            if (fileList[0]) {
                reader.readAsText(fileList[0]);
            }
        }
    }, [])


    useEffect(() => {
        checkValidGenes(genes).then((response) => setValidGenes(response))
    }, [genes])

    return (
        <Container>
            <Typography variant="h3" color="secondary.dark" className='p-5'>UPLOAD SINGLE GENE SET</Typography>
            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                Upload a single .txt file containing gene symbols, each on new line OR paste your gene set in
                the text box below
            </Typography>
            <Grid container sx={{ p: 2 }} display={isMobile ? 'block' : 'flex'} spacing={1} justifyContent="center" component={'form'}
                onSubmit={(evt) => {
                    evt.preventDefault();
                    const formData = new FormData(evt.currentTarget)
                    const genesetName = formData.get('name')?.toString()
                    let description = formData.get('description')?.toString()
                    if (!genesetName) throw new Error('no gene set name')
                    if (!description) description = ''
                    const sessionId = params.id
                    checkInSession(sessionId, genesetName).then((response) => {
                        if (response) {
                            setStatus({error:{selected:true, message:"Gene set already exists in this session!"}})
                        } else {
                            addToSessionSets(validGenes, sessionId, genesetName, description ? description : '').then((result) => {setStatus({success:true})}).catch((err) => setStatus({error:{selected:true, message:"Error in adding gene set!"}}))
                        }
                    })                      
                }
                }>
                <Grid direction='column' container item spacing={2} xs={isMobile ? 12 : 6} justifyItems='center' alignItems={'center'} justifyContent={'center'}>
                    <Grid item>
                        <TextField id="outlined-basic" required label="Gene Set Name" variant="outlined" name='name' />
                    </Grid>
                    <Grid item>
                        <TextField
                            id="outlined-basic"
                            label="Description"
                            variant="outlined"
                            name='description'
                            rows={4}
                            multiline
                            placeholder="Gene Set Description (optional)"

                        />
                    </Grid>
                    <Grid item>
                        <Stack direction='row' spacing={2}>
                        <Button
                            variant="contained"
                            component="label"
                            onClick={(event) => {
                                const inputFile = document.getElementById('single-file-input');
                                if (inputFile) {
                                    return inputFile.onclick
                                }
                            }}
                        >
                            Upload File
                            <input
                                id='single-file-input'
                                hidden
                                type="file"
                                onChange={(event) => { readFile(event) }}
                            />
                        </Button>
                        <Button 
                        variant="contained"
                        onClick={downloadExample}>
                            Download Example
                        </Button>
                        </Stack>
 
                    </Grid>
                </Grid>
                <Grid direction='column' item container spacing={3} xs={isMobile ? 12 : 6}>
                    <Grid item container justifyContent={'center'} alignItems={'center'} direction='column'> 
                        <Typography variant='body1' color='secondary'> {validGenes?.length} valid genes found</Typography>
                        <TextField
                            id="standard-multiline-static"
                            multiline
                            rows={10}
                            placeholder="Paste gene symbols here"
                            value={genes}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setGenes(event.target.value);
                            }}
                        />
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 1 }} justifyContent={'center'}>
                        <Grid item>
                            <Button onClick={getExample} variant='outlined' color="secondary">
                                TRY EXAMPLE
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant='outlined' color="secondary" type='submit'>
                                ADD TO SETS
                            </Button>
                        </Grid>
                    </Grid>
                    <Status status={status}/>
                </Grid>
            </Grid>
        </Container>
    )
}