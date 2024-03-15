'use client'
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { ListSubheader, Grid, Container, Stack, Button, Typography, Box, Tooltip, TextField } from '@mui/material';
import { type Gene, type GeneSet } from '@prisma/client';
import vennIcon from '@/public/img/otherLogos/VennDagramIcon.png'
import superVennIcon from '@/public/img/otherLogos/supervennIcon.png'
import heatmapIcon from '@/public/img/otherLogos/visualizeIcon.png'
import umapIcon from '@/public/img/otherLogos/umapPlot2.png'
import Image from 'next/image';
import { Heatmap } from '../../../components/visualize/PlotComponents/Heatmap/Heatmap';
import { VennPlot } from '../../../components/visualize/PlotComponents/Venn/Venn';
import { UpsetPlotV2 } from '../../../components/visualize/PlotComponents/UpSet/Upset';
import { SuperVenn } from '../../../components/visualize/PlotComponents/SuperVenn/SuperVenn';
import upsetIconAlt from '@/public/img/otherLogos/plotly-upset-alt.png'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import html2canvas from 'html2canvas';
import { UMAP } from '@/components/visualize/PlotComponents/Umap/Umap';


function jaccard_similarity(set1: string[], set2: string[]) {
    const union = Array.from(new Set([...set1, ...set2]))
    const intersection = set1.filter(function (n) {
        return set2.indexOf(n) !== -1;
    });
    return intersection.length / union.length
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
    }
    ;
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
    if (div) {
        html2canvas(div).then(function (canvas: { toDataURL: (arg0: string) => any; }) {
            let source = '<?xml version="1.0" standalone="no"?>\r\n' + canvas;
            downloadURI("data:image/svg+xml;charset=utf-8," + encodeURIComponent(source), 'svg-visualization.svg')
            // downloadURI("data:" + myImage, "visualization.png");
        }
        );
    }
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



export function VisualizeLayout({ sessionInfo, sessionId }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    sessionId: string
}) {
    const [checked, setChecked] = React.useState<number[]>(sessionInfo ? sessionInfo.gene_sets.map((geneset, i) => i) : []);
    const selectedSets = React.useMemo(() => { return sessionInfo?.gene_sets.filter((set, index) => checked.includes(index)) }, [checked])
    const [visualization, setVisualization] = React.useState('')
    const [overlap, setOverlap] = React.useState<string[]>([])

    const legendSelectedSets = React.useMemo(() => {
        if (selectedSets) {
            const dataArrays = selectedSets.map((geneset, i) => {
                const newSet = { ...geneset, 'alphabet': '' }
                newSet['alphabet'] = alphabet[i]
                return newSet
            })
            return dataArrays
        } else {
            return []
        }
    }, [selectedSets])

    const data = React.useMemo(() => {
        if (legendSelectedSets) {
            const dataArrays = legendSelectedSets.map((geneset, i) => {
                let genesetRow: { x: string; y: string; value: number, overlap: string[] }[] = []
                for (let [n, innerLoop] of legendSelectedSets.entries()) {
                    const x = geneset.alphabet
                    const y = innerLoop.alphabet
                    const xyJaccard = (x !== y) ? jaccard_similarity(geneset.genes.map((gene) => gene.gene_symbol), innerLoop.genes.map((gene) => gene.gene_symbol)) : 0
                    const geneset1 = geneset.genes.map((gene) => gene.gene_symbol)
                    const geneset2 = innerLoop.genes.map((gene) => gene.gene_symbol)
                    const overlap = (x !== y) ? geneset1.filter((x) => geneset2.includes(x)) : []
                    genesetRow.push({ x: x, y: y, value: xyJaccard, overlap: overlap })
                }
                return genesetRow
            })
            return dataArrays.flat()
        } else {
            return []
        }
    }, [legendSelectedSets]);



    return (
        <Grid container direction='row' spacing={1}>
            <Grid item xs={3}>
                <Stack direction='column' spacing={2}>
                    <GeneSetOptionsList sessionInfo={sessionInfo} checked={checked} setChecked={setChecked} legend={legendSelectedSets} />
                    <Box sx={{ maxWidth: 250, bgcolor: 'background.paper', borderRadius: 2, height: 200, boxShadow: 2 }}>
                        <ListSubheader>
                            Genes ({overlap.length})
                        </ListSubheader>
                        <TextField
                            multiline
                            rows={5}
                            sx={{
                                "& fieldset": { border: 'none' },
                            }}
                            value={overlap.join('\n')}
                        >

                        </TextField>
                    </Box>
                </Stack>

            </Grid>
            <Grid item xs={9}>
                <Stack direction='column' spacing={2}>
                    <Stack direction='row' spacing={3} sx={{ justifyContent: 'center' }}>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('Venn')} disabled={true}>
                            <Image
                                src={vennIcon}
                                fill
                                alt=""
                                style={{ padding: "10%", objectFit: "contain" }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Button>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('SuperVenn')} disabled={!(checked.length < 11 && checked.length > 0)}>
                            <Image
                                src={superVennIcon}
                                fill
                                alt=""
                                style={{ padding: "10%", objectFit: "contain" }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Button>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('UpSet')} disabled={!(checked.length < 11 && checked.length > 0)}>
                            <Image
                                src={upsetIconAlt}
                                fill
                                alt=""
                                style={{ padding: "10%", objectFit: "contain" }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Button>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('Heatmap')} disabled={!(checked.length < 31 && checked.length > 0)}>
                            <Image
                                src={heatmapIcon}
                                fill
                                alt=""
                                style={{ padding: "10%", objectFit: "contain" }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Button>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('UMAP')}>
                            <Image
                                src={umapIcon}
                                fill
                                alt=""
                                style={{ padding: "10%", objectFit: "contain" }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Button>
                    </Stack>
                    <Box sx={{ boxShadow: 2, borderRadius: 2, minHeight: 400 }}>
                        <Stack direction='column' sx={{ p: 0 }}>
                            <Box sx={{ backgroundColor: '#C9D2E9', minHeight: 50, minWidth: '100%' }}>
                                {/* <Typography variant='h3' style={{ textAlign: 'center', padding: 5 }} color={'secondary.dark'}>VISUALIZATION</Typography> */}
                                <Stack direction='row' spacing={2} sx={{ justifyContent: 'center', padding: 2 }}>
                                    <Button variant='outlined' color='secondary' sx={{ borderRadius: 2 }} onClick={() => {
                                        downloadPNG('visualization')
                                    }}
                                    ><CloudDownloadIcon />&nbsp;<Typography >PNG</Typography></Button>
                                    <Button variant='outlined' color='secondary' sx={{ borderRadius: 2 }} onClick={() => { downloadSVG()}} disabled={visualization === 'SuperVenn'}><CloudDownloadIcon />&nbsp;<Typography >SVG</Typography></Button>
                                    <Button variant='outlined' color='secondary' sx={{ borderRadius: 2 }} onClick={() => { downloadLegend('legend.txt', (legendSelectedSets.map((item) => item.alphabet + ': ' + item.name)).join('\n')) }}><CloudDownloadIcon />&nbsp;<Typography >Legend</Typography></Button>
                                    <Tooltip
                                        title={
                                            <React.Fragment>
                                                <Typography color="inherit">Legend:</Typography>
                                                <Typography color="inherit" variant='body2'>
                                                    {legendSelectedSets.map((item) => item.alphabet + ': ' + item.name + '\n')}
                                                </Typography>
                                            </React.Fragment>
                                        }>
                                        <Button variant='outlined' color='secondary' sx={{ borderRadius: 2 }}><VisibilityIcon />&nbsp;<Typography > Legend</Typography></Button>
                                    </Tooltip>
                                </Stack>
                            </Box>
                            <Box sx={{ justifyContent: 'center' }}>
                                <div className='flex justify-center' id="visualization" style={{ backgroundColor: '#FFFFFF', position: 'relative', minHeight: '500px', minWidth: '500px' }}>
                                    {(visualization === 'Heatmap' && checked.length < 31 && checked.length > 0) && <Heatmap data={data} width={300} height={300} setOverlap={setOverlap} />}
                                    {/* {visualization === 'Venn' && <VennPlot selectedSets={legendSelectedSets} />} */}
                                    {(visualization === 'SuperVenn' && checked.length < 11 && checked.length > 0) && <SuperVenn selectedSets={legendSelectedSets} />}
                                    {(visualization === 'UpSet' && checked.length < 11 && checked.length > 0) && <UpsetPlotV2 selectedSets={legendSelectedSets} setOverlap={setOverlap} />}
                                    {(visualization === 'UMAP' && checked.length > 0) && <UMAP selectedSets={legendSelectedSets} setOverlap={setOverlap} />}
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
        <List sx={{ maxWidth: 250, bgcolor: 'background.paper', overflow: 'scroll', borderRadius: 2, minHeight: 400, maxHeight: 650, boxShadow: 2 }}>
            <ListSubheader>
                My Gene Sets ({checked.length})
            </ListSubheader>
            {sessionInfo?.gene_sets.map((geneset, i) => {
                const labelId = `checkbox-list-label-${i}`;
                if (legendIds.includes(geneset.id)) {
                    return (
                        <ListItem
                            key={i}
                            disablePadding
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
