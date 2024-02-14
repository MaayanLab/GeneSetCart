'use client'
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { ListSubheader, Grid, Container, Stack, Button, Typography, Box } from '@mui/material';
import { type Gene, type GeneSet } from '@prisma/client';
import vennIcon from '@/public/img/otherLogos/VennDagramIcon.png'
import superVennIcon from '@/public/img/otherLogos/supervennIcon.png'
import upsetplotIcon from '@/public/img/otherLogos/upsetplotIcon.png'
import heatmapIcon from '@/public/img/otherLogos/visualizeIcon.png'
import umapIcon from '@/public/img/otherLogos/umapIcon.png'
import Image from 'next/image';
import { Heatmap } from './PlotComponents/Heatmap/Heatmap';
import { VennPlot } from './PlotComponents/Venn/Venn';
import { UpsetPlotV2 } from './PlotComponents/UpSet/Upset';
import { SuperVenn } from './PlotComponents/SuperVenn/SuperVenn';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';

function jaccard_similarity(set1: string[], set2: string[]) {
    const union = Array.from(new Set([...set1, ...set2]))
    const intersection = set1.filter(function (n) {
        return set2.indexOf(n) !== -1;
    });

    return intersection.length / union.length
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
    const data = React.useMemo(() => {
        if (selectedSets) {
            const dataArrays = selectedSets.map((geneset, i) => {
                let genesetRow: { x: string; y: string; value: number }[] = []
                for (let [n, innerLoop] of selectedSets.entries()) {
                    const x = geneset.name
                    const y = innerLoop.name
                    const xyJaccard = (x !== y) ? jaccard_similarity(geneset.genes.map((gene) => gene.gene_symbol), innerLoop.genes.map((gene) => gene.gene_symbol)) : 0
                    genesetRow.push({ x: alphabet[i], y: alphabet[n], value: xyJaccard })
                }
                return genesetRow
            })
            return dataArrays.flat()
        } else {
            return []
        }
    }, [selectedSets])


    return (
        <Grid container direction='row' spacing={1}>
            <Grid item xs={3}>
                <GeneSetOptionsList sessionInfo={sessionInfo} checked={checked} setChecked={setChecked} />
            </Grid>
            <Grid item xs={9}>
                <Stack direction='column' spacing={2}>
                    <Stack direction='row' spacing={3} sx={{ justifyContent: 'center' }}>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('Venn')}>
                            <Image
                                src={vennIcon}
                                fill
                                alt=""
                                style={{ padding: "10%", objectFit: "contain" }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Button>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('SuperVenn')}>
                            <Image
                                src={superVennIcon}
                                fill
                                alt=""
                                style={{ padding: "10%", objectFit: "contain" }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Button>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('UpSet')}>
                            <Image
                                src={upsetplotIcon}
                                fill
                                alt=""
                                style={{ padding: "10%", objectFit: "contain" }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Button>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => setVisualization('Heatmap')}>
                            <Image
                                src={heatmapIcon}
                                fill
                                alt=""
                                style={{ padding: "10%", objectFit: "contain" }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                        </Button>
                        <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}>
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
                                <Stack direction='row' spacing={2} sx={{justifyContent:'center', padding:2}}>
                                    <Button variant='outlined' color='secondary' sx={{borderRadius:2}}><CloudDownloadIcon />&nbsp;<Typography >PNG</Typography></Button>
                                    <Button variant='outlined' color='secondary' sx={{borderRadius:2}}><CloudDownloadIcon />&nbsp;<Typography >SVG</Typography></Button>
                                    <Button variant='outlined' color='secondary' sx={{borderRadius:2}}><CloudDownloadIcon />&nbsp;<Typography >Legend</Typography></Button>
                                    <Button variant='outlined' color='secondary' sx={{borderRadius:2}}><VisibilityIcon />&nbsp;<Typography > Legend</Typography></Button>
                                </Stack>
                            </Box>
                            <Box sx={{ justifyContent: 'center'}}>
                                <div className='flex justify-center' id="venn" style={{backgroundColor:'#FFFFFF'}}>
                                    {visualization === 'Heatmap' && <Heatmap data={data} width={300} height={300} />}
                                    {visualization === 'Venn' && <VennPlot selectedSets={selectedSets} />}
                                    {visualization === 'SuperVenn' && <SuperVenn selectedSets={selectedSets}/> }
                                    {visualization === 'UpSet' && <UpsetPlotV2 selectedSets={selectedSets} />}
                                </div>

                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </Grid>
        </Grid >


    )
}

export function GeneSetOptionsList({ sessionInfo, checked, setChecked }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    checked: number[],
    setChecked: React.Dispatch<React.SetStateAction<number[]>>
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
    return (
        <List sx={{ maxWidth: 250, bgcolor: 'background.paper', overflow: 'scroll', borderRadius: 2, minHeight: 400, maxHeight: 650, boxShadow: 2 }}>
            <ListSubheader>
                My Gene Sets
            </ListSubheader>
            {sessionInfo?.gene_sets.map((geneset, i) => {
                const labelId = `checkbox-list-label-${i}`;
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

export function VisualizeBox() {

}