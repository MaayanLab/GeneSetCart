'use client'
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { ListSubheader } from '@mui/material';


export const LibraryList = ({libraries, checked, setChecked} : {libraries:string[], checked: number[], setChecked: React.Dispatch<React.SetStateAction<number[]>>}) => {

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
        <List sx={{ maxWidth: 250, maxHeight: 400, bgcolor: 'background.paper', overflow:'scroll', wordBreak:'break-word' }}>
          <ListSubheader>
            Results found ({libraries.length})
          </ListSubheader>
        {libraries.map((library, value) => {
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
                <ListItemText id={labelId} primary={library} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    )
}