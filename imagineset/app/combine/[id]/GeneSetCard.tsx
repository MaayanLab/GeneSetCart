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
        <Box sx={{ maxWidth: 400 }}>
            <Card variant="outlined" sx={{minHeight: 400, maxHeight: 500, overflowY: 'scroll'}}>
                <CardHeader
                    title="Select Sets to Combine"
                    titleTypographyProps={{color:'secondary.dark', fontSize: 18 }}
                    style={{ textAlign: 'center' }}
                />
                <CardContent>
                    <SelectedGenesetList sessionGeneSets={sessionGeneSets} numSelectOptions={numSelectOptions} selectedSets={selectedSets} setSelectedSets={setSelectedSets} setNumSelectOptions={setNumSelectOptions}/>
                    <div className="flex justify-center">
                    <Button onClick={() =>{setNumSelectOptions(oldNum => oldNum + 1)}} color="tertiary"><AddCircleIcon /></Button>
                    </div>
                </CardContent>
            </Card>
        </Box>
    )
}




export function SelectedGenesetList({ sessionGeneSets, numSelectOptions, setNumSelectOptions, selectedSets, setSelectedSets  }: {
    sessionGeneSets: ({
        genes: Gene[];
    } & GeneSet)[],
    numSelectOptions: number,
    setNumSelectOptions: React.Dispatch<React.SetStateAction<number>>
    selectedSets: ({
        genes: Gene[];
    } & GeneSet)[], setSelectedSets: React.Dispatch<React.SetStateAction<({
        genes: Gene[];
    } & GeneSet)[]>>
}) {

    let dropDownCountArray = [];
    for (var i = 0; i < numSelectOptions; i++) {
        dropDownCountArray.push(i);
    }
    return (
        <Stack spacing={2}>
            {dropDownCountArray.map((i) => <GenesetSelectDropDown key={i} sessionGenesets={sessionGeneSets} selectedSets={selectedSets} setSelectedSets={setSelectedSets}  setNumSelectOptions={setNumSelectOptions} index={i}/>)}
        </Stack>
    )
}


function GenesetSelectDropDown({ sessionGenesets, selectedSets, setSelectedSets, setNumSelectOptions, index }: {
    sessionGenesets: ({
        genes: Gene[];
    } & GeneSet)[], 
    selectedSets: ({
        genes: Gene[];
    } & GeneSet)[], setSelectedSets: React.Dispatch<React.SetStateAction<({
        genes: Gene[];
    } & GeneSet)[]>>, 
    setNumSelectOptions: React.Dispatch<React.SetStateAction<number>>, 
    index: number
}) {

    const [selected, setSelected] = React.useState('')
    const handleChange = (event: SelectChangeEvent) => {
        const newSelected = event.target.value
        const selectedGeneset = sessionGenesets.find((geneset) => geneset.name === newSelected)
        if (selectedGeneset ) {
            const newSelectedArray = [...selectedSets]
            newSelectedArray[index] = selectedGeneset
            setSelectedSets(newSelectedArray)
        }
        setSelected(event.target.value as string);
    };

    const removeDropDown = (event:  React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const selectedGeneset = sessionGenesets.find((geneset) => geneset.name === selected)
        if (selectedGeneset ) {
            const selectedCopy = [...selectedSets]
            const index = selectedCopy.indexOf(selectedGeneset);
            if (index > -1) { 
                selectedCopy.splice(index, 1); 
            }
            setSelectedSets(selectedCopy)
            setSelected('')
        }
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
                <Button onClick={(event) => removeDropDown(event)} color="tertiary"><RemoveCircleIcon /></Button>
            </Grid>
        </Grid>
    );
}