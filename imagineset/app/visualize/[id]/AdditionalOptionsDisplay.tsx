import { Button, Checkbox, FormControlLabel, Stack, TextField, Switch, Tooltip, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import { UMAPOptionsType } from './VisualizeLayout';
import React from 'react';
import { OptionsSlider } from './OptionsSlider';
import { loadDataFileExample } from '@/components/visualize/PlotComponents/Umap/getUMAP';
import InfoIcon from '@mui/icons-material/Info';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FontDownloadOffIcon from '@mui/icons-material/FontDownloadOff';
import FontDownloadIcon from '@mui/icons-material/FontDownload';

export function AdditionalOptions({ visualization, umapOptions, setUmapOptions, heatmapOptions, setHeatmapOptions }:
    {
        visualization: string,
        umapOptions: UMAPOptionsType,
        setUmapOptions: React.Dispatch<React.SetStateAction<UMAPOptionsType>>,
        heatmapOptions: { diagonal: boolean; interactive: boolean, palette: string, fontSize: number, disableLabels: boolean },
        setHeatmapOptions: React.Dispatch<React.SetStateAction<{
            diagonal: boolean;
            interactive: boolean;
            palette: string;
            fontSize: number;
            disableLabels: boolean
        }>>
    }) {
    const [switchChecked, setSwitchChecked] = React.useState(false)
    const handleSwitchChange = React.useCallback(() => {
        setSwitchChecked((oldchecked) => !oldchecked)
    }, [])

    const downloadExample = React.useCallback(() => {
        loadDataFileExample().then((response) => {
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(response));
            element.setAttribute('download', 'example data file.csv');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        })
    }, [])


    const loadDataFile = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (fileList) {
            const label = document.getElementById('file-input-label');
            if (label) {
                label.textContent = `${fileList[0].name}`;
            }
        }
        if (fileList) {
            try {
                const reader = new FileReader();
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
                <Stack direction='row' spacing={2} sx={{ justifyContent: 'center', padding: 1 }}>
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
                                sx={{ mt: 1 }}
                            >
                                <Tooltip title='Upload a .csv file with each gene set in your list mapped to their group. Gene sets should be on the first column and groups in the second. To ensure proper display, please enter a  MAX OF 27 GROUPS.' placement="top">
                                    <div>
                                        <span>Load data file</span> &nbsp;
                                        <InfoIcon />
                                    </div>
                                </Tooltip>

                                <input
                                    type="file"
                                    hidden
                                    onChange={loadDataFile}
                                />
                            </Button>
                            <span id="file-input-label"></span>
                            <Button
                                color='secondary'
                                variant='contained'
                                onClick={downloadExample}
                            >
                                Example data file
                            </Button>
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
                    <Stack sx={{ justifyContent: 'center', padding: 1, flexDirection: 'row' }}>
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

    if (visualization === 'Heatmap') {
        return (
            <Stack direction='row' spacing={2} sx={{ justifyContent: 'center', padding: 1 }}>
                <FormControlLabel
                    label="Mask Diagonal"
                    control={
                        <Checkbox
                            checked={!heatmapOptions.diagonal}
                            onChange={(evt) => {
                                setHeatmapOptions({ ...heatmapOptions, diagonal: !heatmapOptions.diagonal })
                            }
                            }
                        />
                    }
                />
                <FormControlLabel
                    label="Interactive"
                    control={
                        <Switch
                            color='secondary'
                            checked={heatmapOptions.interactive}
                            onChange={(evt) => {
                                setHeatmapOptions({ ...heatmapOptions, interactive: !heatmapOptions.interactive })
                            }}
                        />
                    }
                />
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="color-palette" color='secondary'>Color Palette</InputLabel>
                    <Select
                        labelId="color-palette"
                        value={heatmapOptions.palette}
                        label="Color Palette"
                        onChange={(evt) => {
                            setHeatmapOptions({ ...heatmapOptions, palette: evt.target.value })
                        }}
                        color='secondary'
                    >
                        <MenuItem value={'viridis'}>viridis</MenuItem>
                        <MenuItem value={'inferno'}>inferno</MenuItem>
                        <MenuItem value={'magma'}>magma</MenuItem>
                        <MenuItem value={'plasma'}>plasma</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    id="input-with-icon-textfield"
                    label="Font size"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FormatSizeIcon />
                            </InputAdornment>
                        ),
                        type: 'number'
                    }}
                    variant="standard"
                    sx={{ width: 80 }}
                    color='secondary'
                    value={heatmapOptions.fontSize}
                    onChange={(evt) => setHeatmapOptions({ ...heatmapOptions, fontSize: parseInt(evt.target.value) })}
                />
                {heatmapOptions.disableLabels &&
                    <Tooltip title={"Enable axis tick labels"}>
                        <div>
                            <Button>
                                <FontDownloadOffIcon color='secondary' onClick={(evt) => setHeatmapOptions({ ...heatmapOptions, disableLabels: !heatmapOptions.disableLabels })} />
                            </Button>
                        </div>
                    </Tooltip>}
                {!heatmapOptions.disableLabels &&
                    <Tooltip title={"Disable axis tick labels"}>
                        <div>
                            <Button>
                                <FontDownloadIcon color='secondary' onClick={(evt) => setHeatmapOptions({ ...heatmapOptions, disableLabels: !heatmapOptions.disableLabels })} />
                            </Button>
                        </div>
                    </Tooltip>}
            </Stack>
        )
    }
}