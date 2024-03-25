import { Button, Checkbox, FormControlLabel, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { UMAPOptionsType } from './VisualizeLayout';
import React from 'react';

export function AdditionalOptions({ visualization, umapOptions, setUmapOptions }: { visualization: string, umapOptions: UMAPOptionsType, setUmapOptions: React.Dispatch<React.SetStateAction<UMAPOptionsType>> }) {
    if (visualization === 'UMAP') {
        console.log(umapOptions)
        const loadDataFile = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
            const fileList = event.target.files
            console.log(fileList)
            if (fileList) {
                try {
                    const reader = new FileReader();
                    if (umapOptions.filetype === 'CSV') {
                        reader.addEventListener(
                            "load",
                            () => {
                                if (reader.result) {
                                    let dataGroups : {[key: string]: string} = {}
                                    reader.result.toString()
                                    .split('\n')
                                    .forEach((row, i)=> {
                                        dataGroups[row.split(',')[0]] = row.split(',')[1].replaceAll('\r', '')})
                                    setUmapOptions({...umapOptions, dataGroups: dataGroups})
                                }
                            },
                            false,
                        );
                    } else {
                        reader.addEventListener(
                            "load",
                            () => {
                                if (reader.result) {
                                    console.log(reader.result)
                                    let dataGroups = JSON.parse(reader.result.toString())
                                    console.log(dataGroups)
                                    setUmapOptions({...umapOptions, dataGroups: dataGroups})
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
        }, [umapOptions])

        return (
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
                        <FormControl sx={{ minWidth: 100 }}>
                            <InputLabel id="filetype-select-label" color="secondary">File Type</InputLabel>
                            <Select
                                labelId="filetype-select"
                                id="filetype-select"
                                value={umapOptions.filetype}
                                label="File type"
                                onChange={(evt) => setUmapOptions({ ...umapOptions, filetype: evt.target.value as string})}
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
            </Stack>
        )
    }
}