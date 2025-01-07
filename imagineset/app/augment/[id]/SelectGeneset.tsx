'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Gene, GeneSet } from '@prisma/client';
import { MenuProps } from '@/app/combine/[id]/GeneSetCard';

export default function GenesetSelect({ sessionGenesets, selected, setSelected }: {
    sessionGenesets: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    selected: string,
    setSelected: React.Dispatch<React.SetStateAction<string>>
}) {

    const handleChange = (event: SelectChangeEvent) => {
        setSelected(event.target.value as string);
    };

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="augment-geneset-select-label" sx={{ fontSize: 16 }} color='secondary'>Gene Set</InputLabel>
                <Select
                    labelId="augment-geneset-select-label"
                    value={selected}
                    label="Gene Set"
                    onChange={handleChange}
                    color='secondary'
                    MenuProps={MenuProps}
                >
                    {sessionGenesets?.gene_sets.map((geneset, i) => {
                        return <MenuItem key={i} value={geneset.name} disabled={geneset.genes.length == 0}>{geneset.name}</MenuItem>
                    })}
                </Select>
            </FormControl>
        </Box>
    );
}

