'use client'
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';
import { dccInfo } from './DCCIconBtn';
import { ListSubheader } from '@mui/material';

const DCCGenesetOptions = ["LINCS_L1000_Chem_Pert_Consensus_Sigs", "LINCS_L1000_CRISPR_KO_Consensus_Sigs", "GTEx_Tissues_V8_2023",
  "GTEx_Aging_Signatures_2021", "Metabolomics_Workbench_Metabolites_2022", "IDG_Drug_Targets_2022",
  "GlyGen_Glycosylated_Proteins_2022", "KOMP2_Mouse_Phenotypes_2022", "HuBMAP_ASCTplusB_augmented_2022", "MoTrPAC_2023"]

export const genesetLibDCCMap: { [key: string]: string } = {
  "LINCS_L1000_Chem_Pert_Consensus_Sigs": "LINCS",
  "LINCS_L1000_CRISPR_KO_Consensus_Sigs": 'LINCS',
  "GTEx_Tissues_V8_2023": 'GTEx',
  "GTEx_Aging_Signatures_2021": 'GTEx',
  "Metabolomics_Workbench_Metabolites_2022": 'Metabolomics',
  "IDG_Drug_Targets_2022": 'IDG',
  "GlyGen_Glycosylated_Proteins_2022": 'Glycoscience',
  "KOMP2_Mouse_Phenotypes_2022": 'KOMP2',
  "HuBMAP_ASCTplusB_augmented_2022": 'HuBMAP',
  "MoTrPAC_2023": 'MoTrPAC'
}



export const DCCList = ({dccs, checked, setChecked} : {dccs:string[], checked: number[], setChecked: React.Dispatch<React.SetStateAction<number[]>>}) => {

    const handleToggle = (value: number) => () => {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
      setChecked(newChecked);
    };
    
    return (
        <List sx={{ maxWidth: 250, bgcolor: 'background.paper', overflow:'scroll' }}>
          <ListSubheader>
            Results found
          </ListSubheader>
        {Object.values(genesetLibDCCMap).filter((v, i, self) => i == self.indexOf(v)).map((dcc, value) => {
          const labelId = `checkbox-list-label-${value}`;
          return (
            <ListItem
              key={value}
              disablePadding
              disabled={!(dccs.includes(dcc))}
            >
              <ListItemButton onClick={handleToggle(value)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={checked.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={dcc} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    )
}