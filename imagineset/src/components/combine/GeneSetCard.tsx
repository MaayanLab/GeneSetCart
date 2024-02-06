'use client'
import { type Gene, type GeneSet } from "@prisma/client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";

export function GeneSetCard({ sessionGeneSets }: {
    sessionGeneSets: ({
        genes: Gene[];
    } & GeneSet)[]
}) {
    return (
        <Box sx={{ maxWidth: 275 }}>
            <Card variant="outlined">
                <CardContent>
                    <GenesetSelect sessionGenesets={sessionGeneSets} />
                    <Typography variant='body1' color='secondary'> 0 valid genes found</Typography>
                            <TextField
                                id="standard-multiline-static"
                                multiline
                                rows={5}
                                disabled
                                value=''
                            />
                </CardContent>
                <CardActions>
                    <Button size="small" color="secondary">Remove</Button>
                </CardActions>
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
        <Box sx={{ minWidth: 120 }}>
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
        </Box>
    );
}


export function GeneSetCards ({ sessionGeneSets }: {
    sessionGeneSets: ({
        genes: Gene[];
    } & GeneSet)[]
}) {

    const [cardsCount, setCardCount] = React.useState(1)

    let cardCountArray = [];
    for (var i = 0; i < cardsCount; i++) {
      cardCountArray.push(i);
    }
    return (
        cardCountArray.map((i) => <GeneSetCard sessionGeneSets={sessionGeneSets} />)
    )
}