'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { Gene, GeneSet } from '@prisma/client';
import { text } from 'stream/consumers';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';

export default function GenesetSelect({ sessionGenesets }: {
    sessionGenesets: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null
}) {

    const [age, setAge] = React.useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setAge(event.target.value as string);
    };

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label" sx={{ fontSize: 16 }} color='secondary' >Gene Set</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={age}
                    label="Gene Set"
                    onChange={handleChange}
                    color='secondary'
                >
                    {sessionGenesets?.gene_sets.map((geneset) => {
                        return <MenuItem value={geneset.name}>{geneset.name}</MenuItem>
                    })}
                </Select>
            </FormControl>
        </Box>
    );
}

export function AugmentLayout({ sessionGenesets }: {
    sessionGenesets: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null
}) {

    const [textAreaGenes, setTextAreaGenes] = React.useState('')
    const [includeOriginal, setIncludeOriginal] = React.useState(true)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIncludeOriginal(event.target.checked);
    };

    return (
        <div className="flex justify-center">
            <div className="w-5/6 align-center" >
                <div className="flex justify-center">
                    <div className='w-full'>
                        <GenesetSelect sessionGenesets={sessionGenesets} />
                    </div>
                </div>
                <Grid container direction='row' sx={{ mt: 3 }} justifyItems={'center'} justifyContent={'center'}>
                    <Grid item xs={12} container justifyContent={'center'}>
                        <Button variant="outlined" color='secondary' sx={{ m: 1 }}> PPI </Button>
                        <Button variant="outlined" color='secondary' sx={{ m: 1 }}> CO-EXPRESSION </Button>
                        <Button variant="outlined" color='secondary' sx={{ m: 1 }}> LITERATURE CO-MENTIONS </Button>
                    </Grid>
                    <Grid item container direction='row' xs={8} sx={{ mt: 1 }} >
                        <Grid item container direction='column' xs={6} alignItems={'center'} sx={{ mt: 1 }}>
                            <Typography variant='body1' color='secondary'> {textAreaGenes.length} valid genes found</Typography>
                            <TextField
                                id="standard-multiline-static"
                                multiline
                                rows={10}
                                disabled
                                value={textAreaGenes}
                            />
                        </Grid>
                        <Grid item container direction='row' xs={6} sx={{ mt: 1 }} spacing={1} >
                            <Grid item xs={12} justifyItems={'center'}>
                                <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox checked={includeOriginal} onChange={handleChange} name="include-original" />
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
                                    variant="filled"
                                    color='secondary'
                                />
                            </Grid>
                            <Grid item xs={12}>

                                <TextField
                                    label="Gene Set Name"
                                    sx={{ fontSize: 16 }}
                                    variant="filled"
                                    color='secondary'
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color='tertiary'>ADD TO SETS</Button>
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>

            </div>

        </div>

    )
}