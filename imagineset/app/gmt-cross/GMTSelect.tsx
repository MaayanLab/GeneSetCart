import React from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export const CFDELibraryOptions: { [key: string]: string } = {
    "LINCS L1000 CMAP Chemical Pertubation Consensus Signatures": 'LINCS',
    'LINCS L1000 CMAP CRISPR Knockout Consensus Signatures': 'LINCS',
    'GTEx Tissue Gene Expression Profiles': 'GTEx',
    'GTEx Tissue-Specific Aging Signatures': 'GTEx',
    'Metabolomics Gene-Metabolite Associations': 'Metabolomics',
    'IDG Drug Targets': 'IDG',
    'Glygen Glycosylated Proteins': 'GlyGen',
    'KOMP2 Mouse Phenotypes': 'KOMP2',
    'MoTrPAC Rat Endurance Exercise Training': 'MoTrPAC'
}

export function GMTSelect({selectedLibs, setSelectedLibs, index, selectedDCCs, setSelectedDCCs} : {selectedLibs: string[], setSelectedLibs: React.Dispatch<React.SetStateAction<string[]>>, index: number, selectedDCCs: string[], setSelectedDCCs: React.Dispatch<React.SetStateAction<string[]>>}) {
    const [library, setLibrary] = React.useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setLibrary(event.target.value as string);
        const newArr = [...selectedLibs];
        newArr.splice(index, 1, event.target.value as string);
        setSelectedLibs(newArr)
        const newArrDCCs = [...selectedDCCs];
        newArrDCCs.splice(index, 1, CFDELibraryOptions[event.target.value as string]);
        setSelectedDCCs(newArrDCCs)
        };
    return (
        <FormControl fullWidth>
            <InputLabel id="gmt-select-label" color="secondary">Common Fund GMT</InputLabel>
            <Select
                labelId="gmt-select"
                id="gmt-select"
                value={library}
                label="Common Fund GMT"
                onChange={handleChange}
                color="secondary"
            >
                {
                    Object.keys(CFDELibraryOptions).map((cfdeLib) =>
                         <MenuItem key={cfdeLib} value={cfdeLib} disabled={(selectedLibs.includes(cfdeLib))}>
                            {cfdeLib}
                        </MenuItem>)
                }
            </Select>
        </FormControl>
    )
}