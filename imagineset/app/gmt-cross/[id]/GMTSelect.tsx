import React from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export const CFDELibraryOptions: { [key: string]: string } = {
    "LINCS_L1000_Chem_Pert_Consensus_Sigs": "LINCS L1000 CMAP Chemical Pertubation Consensus Signatures",
    "LINCS_L1000_CRISPR_KO_Consensus_Sigs": 'LINCS L1000 CMAP CRISPR Knockout Consensus Signatures',
    "GTEx_Tissues_V8_2023": 'GTEx Tissue Gene Expression Profiles',
    "GTEx_Aging_Signatures_2021": 'GTEx Tissue-Specific Aging Signatures',
    "Metabolomics_Workbench_Metabolites_2022": 'Metabolomics Gene-Metabolite Associations',
    "IDG_Drug_Targets_2022": 'IDG Drug Targets',
    "GlyGen_Glycosylated_Proteins_2022": 'Glygen Glycosylated Proteins',
    "KOMP2_Mouse_Phenotypes_2022": 'KOMP2 Mouse Phenotypes',
    // "HuBMAP_ASCTplusB_augmented_2022": 'HuBMAP Anatomical Structures, Cell Types, and Biomarkers (ASCT+B)',
    "MoTrPAC_2023": 'MoTrPAC Rat Endurance Exercise Training'
}

export function GMTSelect({selectedLibs, setSelectedLibs, index} : {selectedLibs: string[], setSelectedLibs: React.Dispatch<React.SetStateAction<string[]>>, index: number}) {
    const [library, setLibrary] = React.useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setLibrary(event.target.value as string);
        const newArr = [...selectedLibs];
        newArr.splice(index, 1, event.target.value as string);
        setSelectedLibs(newArr)
        };
    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label" color="secondary">Common Fund GMT</InputLabel>
            <Select
                labelId="gmt-select"
                id="gmt-select"
                value={library}
                label="Common Fund GMT"
                onChange={handleChange}
                color="secondary"
            >
                {
                    Object.values(CFDELibraryOptions).map((cfdeLib) =>
                        <MenuItem key={cfdeLib} value={cfdeLib} disabled={(selectedLibs.includes(cfdeLib)) || (cfdeLib === "LINCS L1000 CMAP Chemical Pertubation Consensus Signatures") || (cfdeLib === 'LINCS L1000 CMAP CRISPR Knockout Consensus Signatures') }>
                            {cfdeLib}
                        </MenuItem>)
                }
            </Select>
        </FormControl>
    )
}