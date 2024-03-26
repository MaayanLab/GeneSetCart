import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import { UMAPOptionsType } from './VisualizeLayout';

const Input = styled(MuiInput)`
  width: 42px;
`;

export function OptionsSlider({ optionName, range, step, defaultParam, umapOptions, setUmapOptions }: { optionName: string, range: number[], step: number, defaultParam: number,  setUmapOptions: React.Dispatch<React.SetStateAction<UMAPOptionsType>>;
  umapOptions: UMAPOptionsType }) {
  const [value, setValue] = React.useState(defaultParam);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
    if (optionName === 'minDist') {
      setUmapOptions({...umapOptions, minDist: newValue as number})
    }
    if (optionName === 'spread') {
      setUmapOptions({...umapOptions, spread: newValue as number})
    }
    if (optionName === 'nNeighbors') {
      setUmapOptions({...umapOptions, nNeighbors: newValue as number})
    }
  
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value === '' ? range[0] : Number(event.target.value);
    setValue(newValue as number);
    if (optionName === 'minDist') {
      setUmapOptions({...umapOptions, minDist: newValue as number})
    }
    if (optionName === 'spread') {
      setUmapOptions({...umapOptions, spread: newValue as number})
    }
    if (optionName === 'nNeighbors') {
      setUmapOptions({...umapOptions, nNeighbors: newValue as number})
    }
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > range[1]) {
      setValue(range[1]);
    }
  };

  return (
    <Box sx={{ width: 200}}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Typography id="non-linear-slider" gutterBottom>
            {optionName}: <Input
            value={value}
            size="small"
            color='secondary'
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: step,
              min: range[0],
              max: range[1],
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
            sx={{width: 60}}
          />
          </Typography>
          <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            color='secondary'
            min={range[0]}
            max={range[1]}
            step={step}
            sx={{width: 150}}
          />
        </Grid>
        <Grid item>
          
        </Grid>
      </Grid>
    </Box>
  );
}