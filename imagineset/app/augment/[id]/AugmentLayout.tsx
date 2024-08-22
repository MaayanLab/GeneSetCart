'use client'
import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { Gene, GeneSet } from '@prisma/client';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { getGeneshotPredGenes, getPPIGenes } from '@/app/augment/[id]/AugmentFunctions';
import { addToSessionSets, checkInSession } from '@/app/assemble/[id]/AssembleFunctions ';
import CircularIndeterminate from '../../../components/misc/Loading';
import Status from '../../../components/assemble/Status';
import { addStatus } from '../../../components/assemble/fileUpload/SingleUpload';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import GenesetSelect from './SelectGeneset';

export function AugmentLayout({ sessionGenesets, sessionId }: {
    sessionGenesets: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    sessionId: string
}) {

    // const [originalGenes, setoriginalGenes] = React.useState('')
    const [includeOriginal, setIncludeOriginal] = React.useState(true)
    const [selected, setSelected] = React.useState('');
    const [originalGenes, setoriginalGenes] = React.useState<string[]>([])
    const [augmentedGenes, setAugmentedGenes] = React.useState<string[]>([])
    const [textAreaGenes, setTextAreaGenes] = React.useState<string[]>([])
    const [maxAddGenes, setMaxAddGenes] = React.useState(200)
    const [genesetName, setGenesetName] = React.useState('') 
    const [loading, setLoading] = React.useState(false)
    const  [status, setStatus] = React.useState<addStatus>({})

    React.useEffect(() => {
        if (sessionGenesets) {
            for (let geneset of sessionGenesets.gene_sets) {
                if (geneset.name === selected) {
                    setoriginalGenes(geneset.genes.map((gene) => gene.gene_symbol))
                    setTextAreaGenes(geneset.genes.map((gene) => gene.gene_symbol))
                    setAugmentedGenes([])
                }
            }
        } 
    }, [selected, sessionGenesets])

    const geneshotAugment = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>, augmentWith: string) => {
        setLoading(true)
        if (originalGenes) {
            getGeneshotPredGenes(originalGenes, augmentWith)
            .then((response) => {
                setAugmentedGenes(response)
                setGenesetName('Augmented ' + selected)
                setLoading(false)
            }).catch(() => {setLoading(false); setStatus({error:{selected:true, message:'Augmentation failed. Please try again.'} })})
        }
    }, [originalGenes, selected])

    const ppiAugment =  React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setLoading(true)
        if (originalGenes) {
            getPPIGenes(originalGenes)
            .then((response) => {
                setAugmentedGenes(response)
                setGenesetName('Augmented ' + selected)
                setLoading(false)
            })
        }
    }, [originalGenes, selected])

    React.useEffect(() => {
        if (includeOriginal){
            setTextAreaGenes(Array.from(new Set(augmentedGenes.slice(0, maxAddGenes).concat(originalGenes))))
        } else {
            setTextAreaGenes(Array.from(augmentedGenes.slice(0, maxAddGenes)))
        }
    }, [maxAddGenes, includeOriginal, augmentedGenes, originalGenes])

    const handleAddToSets = React.useCallback(() => {
        checkInSession(sessionId, genesetName).then((response) => {
            if (response) {
                setStatus({error:{selected:true, message:"Gene set already exists in this session!"}})
            } else {
                addToSessionSets(textAreaGenes, sessionId, genesetName, '', [], true)
                .then((response) => setStatus({success:true}))
                .catch((err) => {
                    if (err.message === 'No valid genes in gene set') {
                        setStatus({ error: { selected: true, message: err.message } })
                    }                        
                    else if (err.message === 'Empty gene set name') {
                        setStatus({ error: { selected: true, message: err.message } })
                    }
                     else {
                        setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
                    }
                })}
        })  
    }, [textAreaGenes, genesetName, sessionId])


    return (
        <div className="flex justify-center">
            <div className="w-5/6 align-center" >
                <div className="flex justify-center">
                    <div className='w-full'>
                        <GenesetSelect sessionGenesets={sessionGenesets} selected={selected} setSelected={setSelected} />
                    </div>
                </div>
                <Grid container direction='row' sx={{ mt: 3 }} justifyItems={'center'} justifyContent={'center'}>
                    <Grid item xs={12} container justifyContent={'center'}>
                        <Button variant="outlined" color='secondary' sx={{ m: 1 }} onClick={ppiAugment}> PPI </Button>
                        <Button variant="outlined" color='secondary' sx={{ m: 1 }} onClick={(event) => geneshotAugment(event, 'coexpression')}> CO-EXPRESSION </Button>
                        <Button variant="outlined" color='secondary' sx={{ m: 1 }} onClick={(event) => geneshotAugment(event, 'generif')}> LITERATURE CO-MENTIONS </Button>
                        {loading && <CircularIndeterminate />}
                    </Grid>
                    <Grid item container direction='row' xs={10} sx={{ mt: 1 }} >
                        <Grid item container direction='column' xs={6} alignItems={'center'} sx={{ mt: 1 }}>
                            <Typography variant='body1' color='secondary'> {textAreaGenes ? textAreaGenes.length : 0} valid genes found</Typography>
                            <TextField
                                id="standard-multiline-static"
                                multiline
                                rows={10}
                                disabled
                                value={textAreaGenes?.toString().replaceAll(',', '\n')}
                            />
                        </Grid>
                        <Grid item container direction='row' xs={6} sx={{ mt: 1 }} spacing={1} >
                            <Grid item xs={12} justifyItems={'center'}>
                                <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox checked={includeOriginal} onChange={(event) => {
                                                    setIncludeOriginal(event.target.checked); 
                                                    }
                                                } name="include-original" />
                                            }
                                            label="Include original genes in augmented set"
                                        />
                                    </FormGroup>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    inputProps={{ type: 'number' }}
                                    hiddenLabel
                                    label="Max number of additional genes"
                                    sx={{ fontSize: 16 }}
                                    color='secondary'
                                    name='max-Add'
                                    value={maxAddGenes}
                                    onChange={(event) => {
                                        const newMaxAddGenes = parseInt(event.target.value)
                                        setMaxAddGenes(newMaxAddGenes)
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Gene Set Name"
                                    sx={{ fontSize: 16 }}
                                    color='secondary'
                                    name='geneset-name'
                                    value={genesetName}
                                    onChange={(event) => {setGenesetName(event.target.value)}}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <div className='flex justify-center'>
                                <Button variant="contained" color='tertiary' onClick={handleAddToSets}> <AddShoppingCartIcon /> &nbsp; ADD TO CART</Button>
                                </div>
                            </Grid>
                            <Grid item xs={12} sx={{mt: 2}}>
                            <Status status={status}/>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            </div>

        </div>

    )
}