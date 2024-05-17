'use client'
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { ListSubheader } from '@mui/material';


export const genesetLibDCCMap: { [key: string]: string } = {
  'Glygen Glycosylated Proteins': 'GlyGen',
  'GTEx Tissue-Specific Aging Signatures': 'GTEx',
  'GTEx Tissue Gene Expression Profiles': 'GTEx',
  'IDG Drug Targets': 'IDG',
  'KOMP2 Mouse Phenotypes': 'KOMP2',
  'LINCS L1000 CMAP Chemical Pertubation Consensus Signatures': "LINCS",
  'LINCS L1000 CMAP CRISPR Knockout Consensus Signatures': "LINCS",
  'MoTrPAC Rat Endurance Exercise Training' : 'MoTrPAC',
  'Metabolomics Gene-Metabolite Associations': 'Metabolomics',
  // 'Human BioMolecular Atlas Program Azimuth': 'HuBMAP'
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