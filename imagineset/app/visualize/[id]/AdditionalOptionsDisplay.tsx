import { Button, Checkbox, FormControlLabel, Stack, FormControl, InputLabel, Select, MenuItem, Typography, TextField, Switch, Box } from '@mui/material';
import { UMAPOptionsType } from './VisualizeLayout';
import React from 'react';
import { OptionsSlider } from './OptionsSlider';

export function AdditionalOptions({ visualization, umapOptions, setUmapOptions }: { visualization: string, umapOptions: UMAPOptionsType, setUmapOptions: React.Dispatch<React.SetStateAction<UMAPOptionsType>> }) {
    const [switchChecked, setSwitchChecked] = React.useState(false)
    const handleSwitchChange = React.useCallback(() => {
        setSwitchChecked((oldchecked) => !oldchecked)
    }, [])

    const loadDataFile = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (fileList) {
            const label = document.getElementById('file-input-label');
            if (label){
                label.textContent = `${fileList[0].name}`;
            }
          }
        if (fileList) {
            try {
                const reader = new FileReader();
                if (umapOptions.filetype === 'CSV') {
                    reader.addEventListener(
                        "load",
                        () => {
                            if (reader.result) {
                                let dataGroups: { [key: string]: string } = {}
                                reader.result.toString()
                                    .split('\n')
                                    .forEach((row, i) => {
                                        dataGroups[row.split(',')[0]] = row.split(',')[1].replaceAll('\r', '')
                                    })
                                setUmapOptions({ ...umapOptions, dataGroups: dataGroups })
                            }
                        },
                        false,
                    );
                } else {
                    reader.addEventListener(
                        "load",
                        () => {
                            if (reader.result) {
                                let dataGroups = JSON.parse(reader.result.toString())
                                setUmapOptions({ ...umapOptions, dataGroups: dataGroups })
                            }
                        },
                        false,
                    );
                }
                if (fileList[0]) {
                    reader.readAsText(fileList[0]);
                    
                }
            } catch {
                console.log('Error in reading file')
            }
        }
    }, [umapOptions, setUmapOptions])

    if (visualization === 'UMAP') {
        return (
            <>
                <Stack direction='row' spacing={2} sx={{ justifyContent: 'center', padding: 2 }}>
                    <FormControlLabel
                        label="Assign groups"
                        control={
                            <Checkbox
                                checked={umapOptions.assignGroups}
                                onChange={(evt) => {
                                    setUmapOptions({ ...umapOptions, assignGroups: !umapOptions.assignGroups })
                                }
                                }
                            />
                        }
                    />
                    {umapOptions.assignGroups &&
                        <>
                            <Button
                                variant="contained"
                                component="label"
                                color="secondary"
                                sx={{ mt: 3, }}
                            >
                                Load data file
                                <input
                                    type="file"
                                    hidden
                                    onChange={loadDataFile}
                                />
                            </Button>
                            <span id="file-input-label"></span>
                            <FormControl sx={{ minWidth: 100 }}>
                                <InputLabel id="filetype-select-label" color="secondary">File Type</InputLabel>
                                <Select
                                    labelId="filetype-select"
                                    id="filetype-select"
                                    value={umapOptions.filetype}
                                    label="File type"
                                    onChange={(evt) => setUmapOptions({ ...umapOptions, filetype: evt.target.value as string })}
                                    color="secondary"
                                >
                                    <MenuItem key={'csv'} value={'CSV'}>
                                        CSV
                                    </MenuItem>
                                    <MenuItem key={'json'} value={'JSON'}>
                                        JSON
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    }

                    <FormControlLabel control={<Switch
                        checked={switchChecked}
                        onChange={handleSwitchChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                        color='secondary'
                    />}
                        label="Advanced options"
                    />
                </Stack>

                {switchChecked && <Stack direction='column' spacing={2} sx={{ justifyContent: 'center', padding: 2 }}>
                    <Stack sx={{ justifyContent: 'center', padding: 2, flexDirection: 'row' }}>
                    <OptionsSlider optionName='minDist' range={[0.1, 1]} step={0.1} defaultParam={umapOptions.minDist} umapOptions={umapOptions} setUmapOptions={setUmapOptions} />
                    <OptionsSlider optionName='spread' range={[0, 3]} step={0.01} defaultParam={umapOptions.spread} umapOptions={umapOptions} setUmapOptions={setUmapOptions} />
                    <OptionsSlider optionName='nNeighbors' range={[1, 50]} step={1} defaultParam={umapOptions.nNeighbors} umapOptions={umapOptions} setUmapOptions={setUmapOptions} />
                    <TextField
                        type={'number'}
                        color='secondary'
                        variant='outlined'
                        sx={{ width: 160 }}
                        label="Random state"
                        value={umapOptions.randomState}
                        onChange={(evt) => setUmapOptions({ ...umapOptions, randomState: parseInt(evt.target.value) })}
                    ></TextField>
                    </Stack>
                </Stack>}
            </>
        )
    }
}