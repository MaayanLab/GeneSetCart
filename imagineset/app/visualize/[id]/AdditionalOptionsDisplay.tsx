import { Button, Checkbox, FormControlLabel, Stack, TextField, Switch, Tooltip, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import { UMAPOptionsType } from './VisualizeLayout';
import React from 'react';
import { OptionsSlider } from './OptionsSlider';
import { loadDataFileExample } from '@/components/visualize/PlotComponents/Umap/getUMAP';
import InfoIcon from '@mui/icons-material/Info';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FontDownloadOffIcon from '@mui/icons-material/FontDownloadOff';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import { ColorPallete } from '@/components/visualize/ColorPallete';

export function AdditionalOptions({ visualization, umapOptions, setUmapOptions, heatmapOptions, setHeatmapOptions, vennOptions, setVennOptions, upSetOptions, setUpSetOptions }:
    {
        visualization: string,
        umapOptions: UMAPOptionsType,
        setUmapOptions: React.Dispatch<React.SetStateAction<UMAPOptionsType>>,
        heatmapOptions: { diagonal: boolean; interactive: boolean, palette: string, fontSize: number, disableLabels: boolean, annotationText: boolean },
        setHeatmapOptions: React.Dispatch<React.SetStateAction<{
            diagonal: boolean;
            interactive: boolean;
            palette: string;
            fontSize: number;
            disableLabels: boolean
            annotationText: boolean
        }>>,
        vennOptions: { palette: string },
        setVennOptions: React.Dispatch<React.SetStateAction<{
            palette: string;
        }>>
        upSetOptions: { color: string },
        setUpSetOptions: React.Dispatch<React.SetStateAction<{
            color: string;
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
    if (visualization === 'UpSet') {
        return (
            <Stack direction='row' spacing={2} sx={{ justifyContent: 'center', padding: 1 }}>
                <FormControlLabel
                    label="Color"
                    control={
                        <input type='color' onChange={(evt) => { setUpSetOptions({ color: evt.target.value }) }} value={upSetOptions.color}></input>
                    }
                />
            </Stack>
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
                    label="Annotation Text"
                    control={
                        <Checkbox
                            checked={heatmapOptions.annotationText}
                            onChange={(evt) => {
                                setHeatmapOptions({ ...heatmapOptions, annotationText: !heatmapOptions.annotationText })
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
                        <MenuItem value={'viridis'}>
                            <div style={{ display: 'inline-flex' }}>Viridis <ColorPallete hexCodes={['#fde725', '#5ec962', '#21918c', '#3b528b', '#440154']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'inferno'}>
                            <div style={{ display: 'inline-flex' }}>Inferno <ColorPallete hexCodes={['#fcffa4', '#f98e09', '#bc3754', '#57106e', '#000004']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'magma'}>
                            <div style={{ display: 'inline-flex' }}>Magma <ColorPallete hexCodes={['#fcfdbf', '#fc8961', '#b73779', '#51127c', '#000004']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'plasma'}>
                            <div style={{ display: 'inline-flex' }}>Plasma <ColorPallete hexCodes={['#f0f921', '#f89540', '#cc4778', '#7e03a8', '#0d0887']} />
                            </div></MenuItem>
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

    if (visualization === 'Venn') {
        return (
            <Stack direction='row' spacing={2} sx={{ justifyContent: 'center', padding: 1 }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="color-palette" color='secondary'>Color Palette</InputLabel>
                    <Select
                        labelId="color-palette"
                        value={vennOptions.palette}
                        label="Color Palette"
                        onChange={(evt) => {
                            setVennOptions({ ...vennOptions, palette: evt.target.value })
                        }}
                        color='secondary'
                    >
                        <MenuItem value={'Viridis'}>
                            <div style={{ display: 'inline-flex' }}>Viridis <ColorPallete hexCodes={['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'Spectral'}>
                            <div style={{ display: 'inline-flex' }}>Spectral <ColorPallete hexCodes={['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'RdYlGn'}>
                            <div style={{ display: 'inline-flex' }}>RdYlGn <ColorPallete hexCodes={['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'RdBu'}>
                            <div style={{ display: 'inline-flex' }}>RdBu <ColorPallete hexCodes={['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'PiYG'}>
                            <div style={{ display: 'inline-flex' }}>PiYG <ColorPallete hexCodes={['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'PRGn'}>
                            <div style={{ display: 'inline-flex' }}>PRGn <ColorPallete hexCodes={['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'RdYlBu'}>
                            <div style={{ display: 'inline-flex' }}>RdYlBu <ColorPallete hexCodes={['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'BrBG'}>
                            <div style={{ display: 'inline-flex' }}>BrBG <ColorPallete hexCodes={['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'RdGy'}>
                            <div style={{ display: 'inline-flex' }}>RdGy <ColorPallete hexCodes={['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'PuOr'}>
                            <div style={{ display: 'inline-flex' }}>PuOr <ColorPallete hexCodes={['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b']} />
                            </div>
                        </MenuItem>
                        <MenuItem value={'Set2'}>
                            <div style={{ display: 'inline-flex' }}>Set2 <ColorPallete hexCodes={['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3']} />
                            </div>
                        </MenuItem>
                    </Select>
                </FormControl>
            </Stack>
        )
    }
}