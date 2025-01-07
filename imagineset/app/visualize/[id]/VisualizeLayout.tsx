'use client'
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { ListSubheader, Grid, Stack, Button, Typography, Box, Tooltip, TextField, useMediaQuery, useTheme, ClickAwayListener, Switch, FormControlLabel } from '@mui/material';
import { PipelineSession, type Gene, type GeneSet } from '@prisma/client';
import vennIcon from '@/public/img/otherLogos/VennDagramIcon.png'
import superVennIcon from '@/public/img/otherLogos/supervennIcon.png'
import heatmapIcon from '@/public/img/otherLogos/visualizeIcon.png'
import umapIcon from '@/public/img/otherLogos/umapPlot2.png'
import Image from 'next/image';
import { UpsetPlotV2 } from '../../../components/visualize/PlotComponents/UpSet/Upset';
import { SuperVenn } from '../../../components/visualize/PlotComponents/SuperVenn/SuperVenn';
import upsetIconAlt from '@/public/img/otherLogos/plotly-upset-alt.png'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import html2canvas from 'html2canvas';
import { UMAP } from '@/components/visualize/PlotComponents/Umap/Umap';
import dynamic from 'next/dynamic'
import { ClusteredHeatmap } from '@/components/visualize/PlotComponents/Heatmap/StaticHeatmap';
import { AdditionalOptions } from './AdditionalOptionsDisplay';
const VennPlot = dynamic(() => import('../../../components/visualize/PlotComponents/Venn/Venn'), { ssr: false })
import { useDebounce } from 'use-debounce';
import { addToSessionSets, checkValidGenes } from '@/app/assemble/[id]/AssembleFunctions';
import { addStatus } from '@/components/assemble/fileUpload/SingleUpload';
import Status from '@/components/assemble/Status';
import ShareIcon from '@mui/icons-material/Share';
import { usePathname, useSearchParams } from 'next/navigation';
import { copyToClipboard } from '@/components/assemble/DCCFetch/CFDEDataTable';
import { Heatmap } from '@/components/visualize/PlotComponents/Heatmap/InteractiveHeatmap';
import { getClustermap, getSuperVenn } from '@/components/visualize/getImageData';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';


const scrollbarStyles = {
    'webkitAppearance': 'none',
    'width': '10px'
};

const scrollbarThumb = {
    'borderRadius': '5px',
    'backgroundColor': 'rgba(0,0,0,.5)',
    'WebkitBoxShadow': '0 0 1px rgba(255,255,255,.5)'
}

export function downloadURI(uri: string, name: string) {
    let element = document.createElement('a');
    element.setAttribute('href', uri);
    element.setAttribute('download', name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


const downloadLegend = (filename: string, text: string) => {
    downloadURI('data:text/plain;charset=utf-8,' + encodeURIComponent(text), filename)
}


function downloadPNG(divId: string, filename: string) {
    if (filename !== '') {
        const div = document.getElementById(divId)
        if (div) {
            html2canvas(div).then(function (canvas: { toDataURL: (arg0: string) => any; }) {
                let myImage = canvas.toDataURL("image/png");
                downloadURI("data:" + myImage, filename + ".png");
            }
            );
        }
    }
}


const downloadSVG = (filename: string) => {
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
        downloadURI("data:image/svg+xml;charset=utf-8," + encodeURIComponent(source), filename + '.svg')
    };
}


function downloadSVGByDiv(divId: string, filename: string) {
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
        downloadURI("data:image/svg+xml;charset=utf-8," + encodeURIComponent(source), filename + '.svg')
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

export type OverlapSelection = {
    name: string,
    overlapGenes: string[]
}

export function VisualizeLayout({ sessionInfo, sessionId }: {
    sessionInfo: (({
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[]
    } & PipelineSession | null)),
    sessionId: string
}) {

    const searchParams = useSearchParams()
    const checkedSets = searchParams.get('checked')
    const visType = searchParams.get('type')
    const pathname = usePathname()

    const [isHumanGenes, setIsHumanGenes] = React.useState(false)
    const [checked, setChecked] = React.useState<number[]>(checkedSets !== null ? checkedSets.split(',').map((item) => parseInt(item)) : []);
    const selectedSets = React.useMemo(() => {
        const sessionGenesets = sessionInfo ? sessionInfo.gene_sets : []
        return sessionGenesets.filter((set, index) => checked.includes(index))
    }, [checked, sessionInfo?.gene_sets])
    const [visualization, setVisualization] = React.useState(visType !== null ? visType : '')
    const [overlap, setOverlap] = React.useState<OverlapSelection>({ name: '', overlapGenes: [] })
    const [assignGroups, setAssignGroups] = React.useState(false)
    const [umapOptions, setUmapOptions] = React.useState<UMAPOptionsType>({ assignGroups: assignGroups, minDist: 0.1, spread: 1, nNeighbors: 15, randomState: 42 })
    const [heatmapOptions, setHeatmapOptions] = React.useState({ diagonal: false, interactive: true, palette: 'viridis', fontSize: 12, disableLabels: false, annotationText: false})
    const [vennOptions, setVennOptions] = React.useState({ palette: 'Viridis' })
    const [upSetOptions, setUpSetOptions] = React.useState({ color: '#000000' })
    const [debouncedUmapOptions] = useDebounce(umapOptions, 500); // Debounce after 500ms
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [status, setStatus] = React.useState<addStatus>({})
    const [open, setOpen] = React.useState(false);
    const [validGenes, setValidGenes] = React.useState<string[]>([])
    React.useEffect(() => {
        checkValidGenes(overlap.overlapGenes.join('\n')).then((result) => setValidGenes(result))
    }, [overlap])


    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(true);
    };

    const currentlegendSelectedSets = React.useMemo(() => {
        // setVisualization('')
        setOverlap({ name: '', overlapGenes: [] })
        if ((checkedSets !== null) && (visType !== null)) {
            setVisualization(visType)
        }
        if (selectedSets) {
            if (selectedSets.length > 26) {
                const dataArrays = selectedSets.map((geneset, i) => {
                    const newSet = { ...geneset, 'alphabet': '' }
                    newSet['alphabet'] = i.toString()
                    return newSet
                })
                if (selectedSets.length > 40) {
                    setHeatmapOptions({ ...heatmapOptions, disableLabels: true })
                }
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

    const [legendSelectedSets] = useDebounce(currentlegendSelectedSets, 800); // Debounce after 500ms

    const addSelectedToCart = React.useCallback(() => {
            addToSessionSets(isHumanGenes ? validGenes : [], sessionId, formatSelectionName(overlap.name), '', isHumanGenes ? [] : overlap.overlapGenes, isHumanGenes)
            .then((result) => setStatus({ success: true }))
            .catch((err) => {
                if (err.message === 'No valid genes in gene set') {
                    setStatus({ error: { selected: true, message: err.message } })
                }
                else if (err.message === 'Empty gene set name') {
                    setStatus({ error: { selected: true, message: err.message } })
                }
                else {
                    setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
                }
            })
    }, [overlap, isHumanGenes, validGenes])

    const formatSelectionName = React.useCallback((overlapSelection: string) => {
        if (visualization === 'Venn') {
            let newOverlapName = overlapSelection.split(',').map((selection) => legendSelectedSets.find((item) => item.alphabet === selection)?.name).join(' ∩ ')
            if (newOverlapName === '') {
                newOverlapName = overlapSelection
            }
            return newOverlapName
        }
        //  else if (visualization === 'UpSet') {
        //     let newOverlapName = overlapSelection.split('').map((selection) => legendSelectedSets.find((item) => item.alphabet === selection)?.name).join(' ∩ ')
        //     if (newOverlapName === '') {
        //         newOverlapName = overlapSelection
        //     }
        //     return newOverlapName
        // }
        else if (visualization === 'Heatmap') {
            let newOverlapName = overlapSelection.split(',').map((selection) => legendSelectedSets.find((item) => item.alphabet === selection)?.name).join(' ∩ ')
            if (newOverlapName === '') {
                newOverlapName = overlapSelection
            }
            return newOverlapName
        }
        else if (visualization === 'UMAP') {
            return overlapSelection
        }
        return overlapSelection
    }, [legendSelectedSets, visualization])

    const downloadHeatmapSVG = React.useCallback(() => {
        let genesetDict: { [key: string]: string[] } = {}
        legendSelectedSets?.forEach((geneset) => {
            const genes = geneset.isHumanGenes ? geneset.genes.map((gene) => gene.gene_symbol) : geneset.otherSymbols
            const genesetName = geneset.alphabet
            genesetDict[genesetName] = genes
        })
        getClustermap(genesetDict, heatmapOptions)
            .then((heatmapImage) => {
                const svgString = `data:image/svg+xml;utf8,${encodeURIComponent(heatmapImage)}`
                downloadURI(svgString, 'Heatmap.svg')
            }).catch((err) => console.log(err))
    }, [legendSelectedSets, heatmapOptions])

    const downloadSuperVennSVG = React.useCallback(() => {
        let genesetDict: { [key: string]: string[] } = {}
        legendSelectedSets?.forEach((geneset) => {
            const genes = geneset.isHumanGenes ? geneset.genes.map((gene) => gene.gene_symbol) : geneset.otherSymbols
            const genesetName = geneset.alphabet
            genesetDict[genesetName] = genes
        })
        getSuperVenn(genesetDict)
            .then((imgString) => {
                const svgString = `data:image/svg+xml;utf8,${encodeURIComponent(imgString)}`
                downloadURI(svgString, 'SuperVenn.svg')
            }).catch((err) => console.log(err))
    }, [legendSelectedSets])


    return (
        <>
            <Grid container direction='row' spacing={1}>
                <Grid item xs={isMobile ? 12 : 3}>
                    <Stack direction='column' spacing={2}>
                        <GeneSetOptionsList sessionInfo={sessionInfo} checked={checked} setChecked={setChecked} legend={legendSelectedSets} />
                        <Box sx={{ maxWidth: '100%', bgcolor: 'background.paper', borderRadius: 2, minHeight: 350, boxShadow: 2, overflowY: 'scroll', wordWrap: 'break-word' }}>
                            <ListSubheader disableSticky={true}>
                                Items ({overlap.overlapGenes === undefined ? 0 : overlap.overlapGenes.length})
                                <Button color='secondary' onClick={addSelectedToCart}>  <AddShoppingCartIcon /> &nbsp;  ADD TO CART</Button>
                            </ListSubheader>
                            <FormControlLabel control={<Checkbox checked={isHumanGenes} onChange={(event) => {
                                setIsHumanGenes(event.target.checked);
                            }} />}
                                label={
                                    <>
                                        <Typography sx={{ fontSize: 14 }}>
                                            Only accept valid human gene symbols
                                        </Typography>
                                        <Typography sx={{ fontSize: 14 }} color='purple'>
                                             ({validGenes.length} valid genes found)
                                        </Typography>
                                    </>

                                }
                                sx={{ padding: 1 }}
                            />
                            <Status status={status} />
                            <TextField color='secondary'
                                variant='outlined'
                                size='small'
                                value={formatSelectionName(overlap.name)}
                                sx={{ marginLeft: 2, marginRight: 2 }}
                                placeholder='Enter name of selected set'
                                onChange={(evt) => setOverlap({ name: evt.target.value, overlapGenes: overlap.overlapGenes })}
                                multiline
                                inputProps={{ style: { resize: "both" } }}
                            />
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
                            <Tooltip title={"Can visualize 1 - 5 selected sets"}>
                                <div>
                                    <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => { setOverlap({ name: '', overlapGenes: [] }); setVisualization('Venn') }} disabled={!(checked.length < 6 && checked.length > 0)}>
                                        <Image
                                            src={vennIcon}
                                            fill
                                            alt=""
                                            style={{ padding: "10%", objectFit: "contain" }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                    </Button>
                                </div>
                            </Tooltip>
                            <Tooltip title={"Can visualize 1 - 10 selected sets "}>
                                <div>
                                    <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => { setOverlap({ name: '', overlapGenes: [] }); setVisualization('SuperVenn') }} disabled={!(checked.length < 11 && checked.length > 0)}>
                                        <Image
                                            src={superVennIcon}
                                            fill
                                            alt=""
                                            style={{ padding: "10%", objectFit: "contain" }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                    </Button>
                                </div>
                            </Tooltip>
                            <Tooltip title={"Can visualize 1 - 10 selected sets"}>
                                <div>
                                    <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => { setOverlap({ name: '', overlapGenes: [] }); setVisualization('UpSet') }} disabled={!(checked.length < 11 && checked.length > 0)}>
                                        <Image
                                            src={upsetIconAlt}
                                            fill
                                            alt=""
                                            style={{ padding: "10%", objectFit: "contain" }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                    </Button>
                                </div>
                            </Tooltip>
                            <Tooltip title={"Can visualize > 1 selected sets "}>
                                <div>
                                    <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => { setOverlap({ name: '', overlapGenes: [] }); setVisualization('Heatmap') }} disabled={!(checked.length > 1)}>
                                        <Image
                                            src={heatmapIcon}
                                            fill
                                            alt=""
                                            style={{ padding: "10%", objectFit: "contain" }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                    </Button>
                                </div>
                            </Tooltip>
                            <Tooltip title={"Can visualize > 5 selected sets "}>
                                <div>
                                    <Button variant='outlined' color='tertiary' sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }} onClick={(event) => { setOverlap({ name: '', overlapGenes: [] }); setVisualization('UMAP') }} disabled={!(checked.length > 5)}>
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
                        <Box sx={{ boxShadow: 2, borderRadius: 10, minHeight: 400, minWidth: '400px', maxWidth: '100%', backgroundColor: '#FFFFFF' }}>
                            <Stack direction='column'>
                                <Box sx={{ minHeight: 50, minWidth: '100%', backgroundColor: '#FFFFFF', borderRadius: 10 }}>
                                    <Stack direction='row' spacing={2} sx={{ justifyContent: 'center', padding: 1, marginTop: 1 }}>
                                        <Button variant='outlined' color='secondary' sx={{ borderRadius: 2, height: 25 }} onClick={() => { downloadPNG('visualization', visualization) }}><CloudDownloadIcon />&nbsp;<Typography >PNG</Typography></Button>
                                        <Button variant='outlined' color='secondary' sx={{ borderRadius: 2, height: 25 }} onClick={() => { if (visualization === 'Venn') { downloadSVGByDiv('venn', visualization) } else if (visualization === 'Heatmap') { downloadHeatmapSVG() } else if (visualization === 'SuperVenn') { downloadSuperVennSVG() } else { downloadSVG(visualization) } }} ><CloudDownloadIcon />&nbsp;<Typography >SVG</Typography></Button>
                                        <Button variant='outlined' color='secondary' sx={{ borderRadius: 2, height: 25 }} onClick={() => { downloadLegend('legend.txt', (legendSelectedSets.map((item) => item.alphabet + ': ' + item.name)).join('\n')) }}><CloudDownloadIcon />&nbsp;<Typography >Legend</Typography></Button>
                                        <ClickAwayListener onClickAway={handleTooltipClose}>
                                            <div>
                                                <Tooltip
                                                    PopperProps={{
                                                        disablePortal: true,
                                                    }}
                                                    onClose={handleTooltipClose}
                                                    open={open}
                                                    disableFocusListener
                                                    disableHoverListener
                                                    disableTouchListener
                                                    title="Copied"
                                                >
                                                    <Button variant='outlined' color='secondary' sx={{ borderRadius: 2, height: 25 }} disabled={sessionInfo?.private} onClick={() => { handleTooltipOpen(); copyToClipboard(`https://genesetcart.cfde.cloud${pathname}?checked=${checked.toString()}&type=${visualization}`) }}><ShareIcon /> &nbsp;<Typography >Share</Typography></Button>
                                                </Tooltip>
                                            </div>
                                        </ClickAwayListener>
                                    </Stack>
                                    {<AdditionalOptions visualization={visualization} umapOptions={umapOptions} setUmapOptions={setUmapOptions} heatmapOptions={heatmapOptions} setHeatmapOptions={setHeatmapOptions} vennOptions={vennOptions} setVennOptions={setVennOptions} upSetOptions={upSetOptions} setUpSetOptions={setUpSetOptions} />}
                                </Box>
                                <Box sx={{ justifyContent: 'center' }}>
                                    <div className='flex justify-center' id="visualization" style={{ backgroundColor: '#FFFFFF', position: 'relative', minHeight: '500px', minWidth: '500px', maxWidth: '100%', borderRadius: '30px' }}>
                                        {(visualization === 'Heatmap' && legendSelectedSets.length > 1 && heatmapOptions.interactive) && <Heatmap legendSelectedSets={legendSelectedSets} heatmapOptions={heatmapOptions} width={700} height={700} setOverlap={setOverlap} />}
                                        {(visualization === 'Heatmap' && legendSelectedSets.length > 1 && !heatmapOptions.interactive) && <ClusteredHeatmap selectedSets={legendSelectedSets} heatmapOptions={heatmapOptions} />}
                                        {visualization === 'Venn' && legendSelectedSets.length < 6 && legendSelectedSets.length > 0 && <VennPlot selectedSets={legendSelectedSets} setOverlap={setOverlap} vennOptions={vennOptions} />}
                                        {(visualization === 'SuperVenn' && legendSelectedSets.length < 11 && legendSelectedSets.length > 0) && <SuperVenn selectedSets={legendSelectedSets} />}
                                        {(visualization === 'UpSet' && legendSelectedSets.length < 11 && legendSelectedSets.length > 0) && <UpsetPlotV2 selectedSets={legendSelectedSets} setOverlap={setOverlap} upSetOptions={upSetOptions} />}
                                        {(visualization === 'UMAP' && legendSelectedSets.length > 5) && <UMAP selectedSets={legendSelectedSets} setOverlap={setOverlap} umapOptions={debouncedUmapOptions} />}
                                    </div>
                                </Box>
                            </Stack>
                        </Box>
                    </Stack>
                </Grid>
            </Grid >
        </>



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
    }[],
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

    // const typedSets = sessionInfo ? sessionInfo.gene_sets.filter((setItem) => (isHumanGenes && setItem.isHumanGenes) || (!isHumanGenes && !setItem.isHumanGenes)) : []

    const legendIds = legend.map((item) => item.id)
    return (
        <List sx={{
            maxWidth: '100%', bgcolor: 'background.paper', overflow: 'scroll', borderRadius: 2, minHeight: 400, maxHeight: 350, boxShadow: 2, '&::-webkit-scrollbar': { ...scrollbarStyles },
            '&::-webkit-scrollbar-thumb': { ...scrollbarThumb }
        }}
        disablePadding
        >
            <ListSubheader>
                My Gene Sets ({checked.length})
                <Stack direction='row'>
                    <Button color='secondary' onClick={() => setChecked(sessionInfo ? sessionInfo.gene_sets.map((geneset, i) => i) : [])}>Select All</Button>
                    <Button color='secondary' onClick={() => setChecked([])}>Deselect All</Button>
                </Stack>
            </ListSubheader>

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
                            dense
                        // disabled={(isHumanGenes && !geneset.isHumanGenes) || (!isHumanGenes && geneset.isHumanGenes)}
                        >
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
