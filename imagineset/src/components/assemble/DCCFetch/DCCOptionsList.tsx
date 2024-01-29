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
import { genesetLibDCCMap } from './CfdeSearch';


export const DCCList = () => {
    const [checked, setChecked] = React.useState([0]);

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
        <List sx={{ maxWidth: 250, bgcolor: 'background.paper', maxHeight: 300, overflow:'scroll' }}>
          <ListSubheader>
            Results found
          </ListSubheader>
        {Object.values(genesetLibDCCMap).filter((v, i, self) => i == self.indexOf(v)).map((dcc, value) => {
          const labelId = `checkbox-list-label-${value}`;
          return (
            <ListItem
              key={value}
              disablePadding
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