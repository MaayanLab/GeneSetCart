'use client'
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { ListSubheader, Grid, Stack, Button, Typography, Box, Tooltip, TextField, useMediaQuery, useTheme } from '@mui/material';
import { type Gene, type GeneSet } from '@prisma/client';
import vennIcon from '@/public/img/otherLogos/VennDagramIcon.png'
import superVennIcon from '@/public/img/otherLogos/supervennIcon.png'
import heatmapIcon from '@/public/img/otherLogos/visualizeIcon.png'
import umapIcon from '@/public/img/otherLogos/umapPlot2.png'
import Image from 'next/image';
import { Heatmap } from '../../../components/visualize/PlotComponents/Heatmap/Heatmap';
import { UpsetPlotV2 } from '../../../components/visualize/PlotComponents/UpSet/Upset';
import { SuperVenn } from '../../../components/visualize/PlotComponents/SuperVenn/SuperVenn';
import upsetIconAlt from '@/public/img/otherLogos/plotly-upset-alt.png'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import html2canvas from 'html2canvas';
import { UMAP } from '@/components/visualize/PlotComponents/Umap/Umap';
import dynamic from 'next/dynamic'
import { ClusteredHeatmap } from '@/components/visualize/PlotComponents/Heatmap/ClusteredHeatmap';
import { AdditionalOptions } from './AdditionalOptionsDisplay';
const VennPlot = dynamic(() => import('../../../components/visualize/PlotComponents/Venn/Venn'), { ssr: false })
import { useDebounce } from 'use-debounce';


const scrollbarStyles = {
    'webkitAppearance': 'none',
    'width': '10px'
};

const scrollbarThumb = {
    'borderRadius': '5px',
    'backgroundColor': 'rgba(0,0,0,.5)',
    'WebkitBoxShadow': '0 0 1px rgba(255,255,255,.5)'
}

const downloadLegend = (filename: string, text: string) => {
    downloadURI('data:text/plain;charset=utf-8,' + encodeURIComponent(text), filename)
}

const downloadSVG = () => {
    //get svg element.
    let svg = document.getElementById("svg");
    if (svg) {
        //get svg source.
        let serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);
        //add name spaces.
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
        //add xml declaration
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
        downloadURI("data:image/svg+xml;charset=utf-8," + encodeURIComponent(source), 'svg-visualization.svg')
    };
}

function downloadURI(uri: string, name: string) {
    let element = document.createElement('a');
    element.setAttribute('href', uri);
    element.setAttribute('download', name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function downloadPNG(divId: string) {
    const div = document.getElementById(divId)
    if (div) {
        html2canvas(div).then(function (canvas: { toDataURL: (arg0: string) => any; }) {
            let myImage = canvas.toDataURL("image/png");
            downloadURI("data:" + myImage, "visualization.png");
        }
        );
    }
}

function downloadSVGHTML(divId: string) {
    const div = document.getElementById(divId)
    const svgEl = div?.firstChild
    if (svgEl) {
        //get svg source.
        let serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgEl);
        //add name spaces.
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
        //add xml declaration
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
        downloadURI("data:image/svg+xml;charset=utf-8," + encodeURIComponent(source), 'svg-visualization.svg')
    };
}

export const alphabet = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
];


export type UMAPOptionsType = {
    assignGroups: boolean
    dataGroups?: { [key: string]: string }
    minDist: number
    spread: number
    nNeighbors: number
    randomState: number
}

export type OverlapSelection ={
    name: string, 
    overlapGenes: string[]
}

export function VisualizeLayout({ sessionInfo, sessionId }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    sessionId: string
}) {
    const [checked, setChecked] = React.useState<number[]>([]);
    const selectedSets = React.useMemo(() => { return sessionInfo?.gene_sets.filter((set, index) => checked.includes(index)) }, [checked, sessionInfo?.gene_sets])
    const [visualization, setVisualization] = React.useState('')
    const [overlap, setOverlap] = React.useState<OverlapSelection>({name:'', overlapGenes:[]})
    const [assignGroups, setAssignGroups] = React.useState(false)
    const [umapOptions, setUmapOptions] = React.useState<UMAPOptionsType>({ assignGroups: assignGroups, minDist: 0.1, spread: 1, nNeighbors: 15, randomState: 42 })
    const [debouncedUmapOptions] = useDebounce(umapOptions, 500); // Debounce after 500ms
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));


    const legendSelectedSets = React.useMemo(() => {
        setVisualization('')
        if (selectedSets) {
            if (selectedSets.length > 26) {
                const dataArrays = selectedSets.map((geneset, i) => {
                    const newSet = { ...geneset, 'alphabet': '' }
                    newSet['alphabet'] = i.toString()
                    return newSet
                })
                return dataArrays
            } else {
                const dataArrays = selectedSets.map((geneset, i) => {
                    const newSet = { ...geneset, 'alphabet': '' }
                    newSet['alphabet'] = alphabet[i]
                    return newSet
                })
                return dataArrays
            }

        } else {
            return []
        }
    }, [selectedSets])
    return (
        <Grid container direction='row' spacing={1}>
            <Grid item xs={isMobile ? 12 : 3}>
                <Stack direction='column' spacing={2}>
                    <GeneSetOptionsList sessionInfo={sessionInfo} checked={checked} setChecked={setChecked} legend={legendSelectedSets} />
                    <Box sx={{ maxWidth: '100%', bgcolor: 'background.paper', borderRadius: 2, height: 350, boxShadow: 2, overflowY:'scroll', wordWrap: 'break-word' }}>
                        {/* <ListSubheader>
                            Selection:  {overlap.name.split(',')
                            .map((setAlphabet) => {
                                const fullSet = legendSelectedSets?.find((set) => set.alphabet=== setAlphabet)
                                return fullSet?.name
                            }).join(' ∩ ')}
                        </ListSubheader> */}
                        <ListSubheader disableSticky={true}>
                            Genes ({overlap.overlapGenes === undefined ? 0 : overlap.overlapGenes.length})
                        </ListSubheader>
                        <TextField
                            multiline
                            rows={9}
                            sx={{
                                "& fieldset": { border: 'none' },
                            }}
                            value={overlap === undefined ? '' : overlap.overlapGenes.join('\n')}
                            disabled
                        >
                        </TextField>
                    </Box>
                </Stack>
            </Grid>
            <Grid item xs={isMobile ? 12 : 9}>
                <Stack direction='column' spacing={2} maxWidth={'100%'}>
                    <Stack direction='row' spacing={3} sx={{ justifyContent: 'center' }} useFlexGap flexWrap="wrap">
                        <Tooltip title={"Can visualize for number of selected sets between 0 and 6 "}>
                            <div>
                                <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('Venn')} disabled={!(checked.length < 6 && checked.length > 0)}>
                                    <Image
                                        src={vennIcon}
                                        fill
                                        alt=""
                                        style={{ padding: "10%", objectFit: "contain" }}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                </Button>
                            </div>
                        </Tooltip>
                        <Tooltip title={"Can visualize for number of selected sets between 0 and 11 "}>
                            <div>
                                <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('SuperVenn')} disabled={!(checked.length < 11 && checked.length > 0)}>
                                    <Image
                                        src={superVennIcon}
                                        fill
                                        alt=""
                                        style={{ padding: "10%", objectFit: "contain" }}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                </Button>
                            </div>
                        </Tooltip>
                        <Tooltip title={"Can visualize for number of selected sets between 0 and 11 "}>
                            <div>
                                <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('UpSet')} disabled={!(checked.length < 11 && checked.length > 0)}>
                                    <Image
                                        src={upsetIconAlt}
                                        fill
                                        alt=""
                                        style={{ padding: "10%", objectFit: "contain" }}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                </Button>
                            </div>
                        </Tooltip>
                        <Tooltip title={"Can visualize for number of selected sets between 1 and 39 "}>
                            <div>
                                <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('Heatmap')} disabled={!(checked.length > 1 && checked.length < 39)}>
                                    <Image
                                        src={heatmapIcon}
                                        fill
                                        alt=""
                                        style={{ padding: "10%", objectFit: "contain" }}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                </Button>
                            </div>
                        </Tooltip>
                        <Tooltip title={"Can visualize for number of selected sets greater than 5 "}>
                            <div>
                                <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('UMAP')} disabled={!(checked.length > 5)}>
                                    <Image
                                        src={umapIcon}
                                        fill
                                        alt=""
                                        style={{ padding: "10%", objectFit: "contain" }}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                </Button>
                            </div>
                        </Tooltip>
                    </Stack>
                    <Box sx={{ boxShadow: 2, borderRadius: 2, minHeight: 400, minWidth: '400px', maxWidth: '100%' }}>
                        <Stack direction='column' sx={{ p: 0 }}>
                            <Box sx={{ backgroundColor: '#C9D2E9', minHeight: 50, minWidth: '100%' }}>
                                <Stack direction='row' spacing={2} sx={{ justifyContent: 'center', padding: 2 }}>
                                    <Button variant='outlined' color='secondary' sx={{ borderRadius: 2 }} onClick={() => { downloadPNG('visualization') }}><CloudDownloadIcon />&nbsp;<Typography >PNG</Typography></Button>
                                    <Button variant='outlined' color='secondary' sx={{ borderRadius: 2 }} onClick={() => { if (visualization === 'Venn') { downloadSVGHTML('venn') } else { downloadSVG() } }} disabled={(visualization === 'SuperVenn') || (visualization === 'Heatmap')}><CloudDownloadIcon />&nbsp;<Typography >SVG</Typography></Button>
                                    <Button variant='outlined' color='secondary' sx={{ borderRadius: 2 }} onClick={() => { downloadLegend('legend.txt', (legendSelectedSets.map((item) => item.alphabet + ': ' + item.name)).join('\n')) }}><CloudDownloadIcon />&nbsp;<Typography >Legend</Typography></Button>
                                </Stack>
                                {<AdditionalOptions visualization={visualization} umapOptions={umapOptions} setUmapOptions={setUmapOptions} />}
                            </Box>
                            <Box sx={{ justifyContent: 'center' }}>
                                <div className='flex justify-center' id="visualization" style={{ backgroundColor: '#FFFFFF', position: 'relative', minHeight: '500px', minWidth: '500px', maxWidth: '100%' }}>
                                    {/* {(visualization === 'Heatmap' && checked.length < 31 && checked.length > 0) && <Heatmap data={data} width={300} height={300} setOverlap={setOverlap} />} */}
                                    {(visualization === 'Heatmap' && checked.length > 1 && checked.length < 39) && <ClusteredHeatmap selectedSets={legendSelectedSets} />}
                                    {visualization === 'Venn' && checked.length < 6 && checked.length > 0 && <VennPlot selectedSets={legendSelectedSets} setOverlap={setOverlap} />}
                                    {(visualization === 'SuperVenn' && checked.length < 11 && checked.length > 0) && <SuperVenn selectedSets={legendSelectedSets} />}
                                    {(visualization === 'UpSet' && checked.length < 11 && checked.length > 0) && <UpsetPlotV2 selectedSets={legendSelectedSets} setOverlap={setOverlap} />}
                                    {(visualization === 'UMAP' && checked.length > 5) && <UMAP selectedSets={legendSelectedSets} setOverlap={setOverlap} umapOptions={debouncedUmapOptions} />}
                                </div>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </Grid>
        </Grid >


    )
}

export function GeneSetOptionsList({ sessionInfo, checked, setChecked, legend }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    checked: number[],
    setChecked: React.Dispatch<React.SetStateAction<number[]>>
    legend: {
        alphabet: string;
        genes: Gene[];
        id: string;
        name: string;
        description: string | null;
        session_id: string;
        createdAt: Date;
    }[]
}) {

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

    const legendIds = legend.map((item) => item.id)
    return (
        <List sx={{
            maxWidth: '100%', bgcolor: 'background.paper', overflow: 'scroll', borderRadius: 2, minHeight: 400, maxHeight: 650, boxShadow: 2, '&::-webkit-scrollbar': { ...scrollbarStyles },
            '&::-webkit-scrollbar-thumb': { ...scrollbarThumb }
        }}>
            <ListSubheader>
                My Gene Sets ({checked.length})
            </ListSubheader>
            <Button color='secondary' onClick={() => setChecked(sessionInfo ? sessionInfo.gene_sets.map((geneset, i) => i) : [])}>Select All</Button>
            <Button color='secondary' onClick={() => setChecked([])}>Deselect All</Button>
            {sessionInfo?.gene_sets.map((geneset, i) => {
                const labelId = `checkbox-list-label-${i}`;
                if (legendIds.includes(geneset.id)) {
                    return (
                        <ListItem
                            key={i}
                            disablePadding
                            sx={{
                                whiteSpace: 'normal !important',
                                wordWrap: 'break-word !important',
                            }}
                        >
                            <ListItemButton
                                onClick={handleToggle(i)}
                                dense>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checked.indexOf(i) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={legend[legendIds.indexOf(geneset.id)].alphabet + ': ' + geneset.name} primaryTypographyProps={{ fontSize: 14 }} />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                return (
                    <ListItem
                        key={i}
                        disablePadding
                        sx={{
                            whiteSpace: 'normal !important',
                            wordWrap: 'break-word !important',
                        }}
                    >
                        <ListItemButton
                            onClick={handleToggle(i)}
                            dense>
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={checked.indexOf(i) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={geneset.name} primaryTypographyProps={{ fontSize: 14 }} />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    )
}
