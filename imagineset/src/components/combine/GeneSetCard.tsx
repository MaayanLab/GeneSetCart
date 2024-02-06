'use client'
import { type Gene, type GeneSet } from "@prisma/client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Stack, CardHeader } from "@mui/material";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export function SelectGenesetsCard({ sessionGeneSets, selectedSets, setSelectedSets }: {
    sessionGeneSets: ({
        genes: Gene[];
    } & GeneSet)[], selectedSets: ({
        genes: Gene[];
    } & GeneSet)[], setSelectedSets: React.Dispatch<React.SetStateAction<({
        genes: Gene[];
    } & GeneSet)[]>>
}) {

    const [numSelectOptions, setNumSelectOptions] = React.useState(1)

    return (
        <Box sx={{ maxWidth: 275 }}>
            <Card variant="outlined">
                <CardHeader
                    title="Select Sets to Combine"
                />
                <CardContent>
                    <SelectedGenesetList sessionGeneSets={sessionGeneSets} numSelectOptions={numSelectOptions} />
                    <Button onClick={() =>{setNumSelectOptions(oldNum => oldNum + 1)}}><AddCircleIcon /></Button>
                </CardContent>
            </Card>
        </Box>
    )
}

function GenesetSelect({ sessionGenesets }: {
    sessionGenesets: ({
        genes: Gene[];
    } & GeneSet)[]
}) {

    const [selected, setSelected] = React.useState('')
    const handleChange = (event: SelectChangeEvent) => {
        setSelected(event.target.value as string);
    };

    return (
        <Grid container direction={'row'}>
            <Grid item xs={10}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label" sx={{ fontSize: 16 }} color='secondary'>Gene Set</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selected}
                        label="Gene Set"
                        onChange={handleChange}
                        color='secondary'
                    >
                        {sessionGenesets.map((geneset, i) => {
                            return <MenuItem key={i} value={geneset.name}>{geneset.name}</MenuItem>
                        })}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={2}>
                <Button><RemoveCircleIcon /></Button>
            </Grid>
        </Grid>
    );
}



export function SelectedGenesetList({ sessionGeneSets, numSelectOptions }: {
    sessionGeneSets: ({
        genes: Gene[];
    } & GeneSet)[],
    numSelectOptions: number
}) {

    let dropDownCountArray = [];
    for (var i = 0; i < numSelectOptions; i++) {
        dropDownCountArray.push(i);
    }
    return (
        <Stack spacing={2}>
            {dropDownCountArray.map((i) => <GenesetSelect sessionGenesets={sessionGeneSets} />)}
        </Stack>
    )
}