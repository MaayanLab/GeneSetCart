import React from 'react';
import { Box, Button, Link, List, ListItem, Stack, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import { Gene, GeneSet } from '@prisma/client';
import { OverlapSelection, alphabet } from '@/app/visualize/[id]/VisualizeLayout';
import { ClusteredHeatmap } from '@/components/visualize/PlotComponents/Heatmap/StaticHeatmap';
import { UpsetPlotV2 } from '@/components/visualize/PlotComponents/UpSet/Upset';
import { UMAP } from '@/components/visualize/PlotComponents/Umap/Umap';
import ReactToPrint from "react-to-print";
import { StaticSuperVenn } from '@/components/visualize/PlotComponents/SuperVenn/StaticSuperVenn';
import DownloadIcon from '@mui/icons-material/Download';
import { getNumbering } from './fetchData';
import { CHEABarChart, EnrichrResults, KEABarChart } from './AnalysisFigures';
import { analysisOptions, visualizationOptions } from "./ReportLayout";
import BasicTable from './OverlapTable';
import { StaticVenn } from '@/components/visualize/PlotComponents/Venn/StaticVenn';


export default function Report({ selectedSets, checked, sessionId, visualizationOptions, disabledOptions, analysisData, analysisOptions }: {
    selectedSets: ({
        genes: Gene[];
    } & GeneSet)[],
    checked: number[],
    sessionId: string,
    visualizationOptions: visualizationOptions,
    disabledOptions: visualizationOptions,
    analysisData: any,
    analysisOptions: analysisOptions

}) {

    const { figureLegends, analysisLegends } = getNumbering(visualizationOptions, analysisOptions, disabledOptions, selectedSets.length)
    const heatmapOptions = { diagonal: false, interactive: true, palette: 'viridis', fontSize: 11, disableLabels: false, annotationText: false }
    const umapOptions = { assignGroups: false, minDist: 0.1, spread: 1, nNeighbors: 15, randomState: 42 }
    const upSetOptions = { color: '#000000' }
    const [overlap, setOverlap] = React.useState<OverlapSelection>({ name: '', overlapGenes: [] })
    const legendSelectedSets = React.useMemo(() => {
        return selectedSets.map((set, i) => {
            if (selectedSets.length > 26) {
                return { ...set, alphabet: i.toString() }
            } else {
                return { ...set, alphabet: alphabet[i] }
            }
        })
    }, [selectedSets])



    const componentRef = React.useRef<HTMLDivElement>(null);

    return (
        <>
            <ReactToPrint
                trigger={() => <Button variant="contained" color="primary"><DownloadIcon /> Download Report</Button>}
                content={() => componentRef.current}
            />
            <div ref={componentRef}>
                <Paper sx={{
                    minWidth: '100%'
                }}>
                    <Typography variant="h4" color="secondary.dark" sx={{ padding: 3 }}>G2SG Report</Typography>
                    <Typography variant="h5" color="secondary.dark" sx={{ borderBottom: 1, marginLeft: 3, marginTop: 2 }}>VISUALIZATION OF OVERLAP</Typography>
                    {(visualizationOptions.heatmap && !disabledOptions.heatmap) && <div className='flex justify-center' style={{ backgroundColor: '#FFFFFF', position: 'relative', minHeight: '500px', minWidth: '500px', maxWidth: '100%', borderRadius: '30px' }}>
                        <Stack direction='column' style={{ breakInside: 'avoid' }}>
                            <ClusteredHeatmap selectedSets={legendSelectedSets.map((set, i) => {
                                return { ...set, alphabet: set.name }
                            })}
                                heatmapOptions={heatmapOptions} />
                            <Typography variant='caption' color='black' sx={{ wordWrap: 'break-word', padding: 2 }}>
                                <strong>Figure {figureLegends.heatmap}.</strong> Jaccard similarity scores between gene sets. This figure contains a clustered heatmap with
                                each cell representing the Jaccard index of each overlap between the gene sets.
                                Visualization from: <Link color='secondary'>https://g2sg.cfde.cloud/visualize/{sessionId}?checked={checked.join(',')}&type=Heatmap</Link>
                            </Typography>
                        </Stack>
                    </div>
                    }
                    {(visualizationOptions.venn && !disabledOptions.venn) && <div className='flex justify-center' style={{ backgroundColor: '#FFFFFF', position: 'relative', minHeight: '500px', minWidth: '500px', maxWidth: '100%', borderRadius: '30px' }}>
                        <Stack direction='column' justifyContent={'center'} style={{ breakInside: 'avoid' }}>
                            <StaticVenn selectedSets={legendSelectedSets} />
                            <Typography variant='caption' color='black' sx={{ wordWrap: 'break-word', padding: 2 }}>
                                <strong>Figure {figureLegends.venn}.</strong> Overlap between the selected gene sets.
                                This figure contains a venn diagram showing the overlap between the gene sets with the number of overlapping genes in each intersection.
                                Visualization from: <Link color='secondary'>https://g2sg.cfde.cloud/visualize/{sessionId}?checked={checked.join(',')}&type=Venn</Link>
                            </Typography>
                        </Stack>
                    </div>}
                    {(visualizationOptions.supervenn && !disabledOptions.supervenn) && <div className='flex justify-center' style={{ backgroundColor: '#FFFFFF', position: 'relative', minHeight: '500px', minWidth: '500px', maxWidth: '100%', borderRadius: '30px' }}>
                        <Stack direction='column' style={{ breakInside: 'avoid' }}>
                            <div style={{ minHeight: '80%' }} className='flex justify-center'>
                                <StaticSuperVenn selectedSets={legendSelectedSets.map((set, i) => {
                                    return { ...set, alphabet: set.name }
                                })} />
                            </div>
                            <Typography variant='caption' color='black' sx={{ wordWrap: 'break-word', padding: 2 }}>
                                <strong>Figure {figureLegends.supervenn}.</strong> Overlap between the selected gene sets. This figure contains a SuperVenn plot showing the overlap between the selected gene sets.
                                The number of overlapping genes is shown at the bottom of each section
                                Visualization from: <Link color='secondary'>https://g2sg.cfde.cloud/visualize/{sessionId}?checked={checked.join(',')}&type=SuperVenn</Link>
                            </Typography>
                        </Stack>
                    </div>}
                    {(visualizationOptions.upset && !disabledOptions.upset) && <div className='flex justify-center' style={{ backgroundColor: '#FFFFFF', position: 'relative', minHeight: '500px', minWidth: '500px', maxWidth: '100%', borderRadius: '30px' }}>
                        <Stack direction='column' style={{ breakInside: 'avoid' }}>
                            <div style={{ minHeight: '80%' }} className='flex justify-center'>
                                <UpsetPlotV2 selectedSets={legendSelectedSets} setOverlap={setOverlap} upSetOptions={upSetOptions} />
                            </div>
                            <Typography variant='caption' color='black' sx={{ wordWrap: 'break-word', padding: 2 }}>
                                <strong>Figure {figureLegends.upset}.</strong> Overlap between the selected gene sets. {legendSelectedSets.map((set) => (set.alphabet) + ': ' + set.name + '; ')}.
                                This figure contains an UpSet plot showing the overlap between the gene sets with the number of overlapping genes in each intersection.
                                Visualization from: <Link color='secondary'>https://g2sg.cfde.cloud/visualize/{sessionId}?checked={checked.join(',')}&type=UpSet</Link>
                            </Typography>
                        </Stack>
                    </div>}
                    {(visualizationOptions.umap && !disabledOptions.umap) && <div className='flex justify-center' style={{ backgroundColor: '#FFFFFF', position: 'relative', minHeight: '500px', minWidth: '500px', maxWidth: '100%', borderRadius: '30px' }}>
                        <Stack style={{ breakInside: 'avoid' }}>
                            <div style={{ minHeight: '80%' }} className='flex justify-center'>
                                <UMAP selectedSets={legendSelectedSets} setOverlap={setOverlap} umapOptions={umapOptions} />
                            </div>
                            <Typography variant='caption' color='black' sx={{ wordWrap: 'break-word', padding: 2 }}>
                                <strong>Figure {figureLegends.umap}.</strong>  Uniform Manifold Approximation and Projection of the selected gene sets clustered with Leiden clustering algorithm.
                                The parameters used for the visualization were set to: min_dist = 0.1, spread = 1, and nNeighbors = 15.
                                Visualization from: <Link color='secondary'>https://g2sg.cfde.cloud/visualize/{sessionId}?checked={checked.join(',')}&type=UMAP</Link>
                            </Typography>
                        </Stack>
                    </div>}
                    <Typography variant="h5" color="secondary.dark" sx={{ borderBottom: 1, marginLeft: 3, marginTop: 2 }}>OVERLAPPING GENES</Typography>
                    <Box sx={{ padding: 3 }}>
                        <BasicTable rows={analysisData['overlappingGenes'] ? analysisData['overlappingGenes'] : []} />
                    </Box>
                    <Typography variant="h5" color="secondary.dark" sx={{ borderBottom: 1, marginLeft: 3, marginTop: 2 }}>ANALYSIS LINKS</Typography>
                    <List sx={{ listStyle: "decimal", marginLeft: 5 }}>
                        {selectedSets.map((geneset, i) =>
                            <ListItem sx={{ display: "list-item" }} key={i}>
                                {geneset.name} ({geneset.genes.length})
                                <Stack direction='column'>
                                    {(analysisData[geneset.id] && analysisOptions.enrichr) &&
                                        <Stack direction='column' sx={{ marginLeft: 5, marginTop: 1 }}>
                                            <Typography variant="h5" color="secondary.dark">{alphabet[analysisLegends.enrichr]}. Enrichr</Typography>
                                            <EnrichrResults data={analysisData[geneset.id]['enrichrResults']} />
                                            <Typography variant='caption' color='black' sx={{ wordWrap: 'break-word', padding: 2 }}>
                                                <strong>Figure {figureLegends.enrichr[i]}.</strong> Enrichment analysis results of the {geneset.name} gene set showing top 5 enriched terms from the
                                                WikiPathway_2023_Human and GO Biological Processes libraries.
                                                Enrichr: <Link color='secondary'>https://maayanlab.cloud/Enrichr/enrich?dataset={analysisData[geneset.id]['enrichrLink']}</Link>
                                            </Typography>
                                        </Stack>
                                    }
                                    {(analysisData[geneset.id] && analysisOptions.kea) &&
                                        <Stack direction='column' sx={{ marginLeft: 5, marginTop: 1 }}>
                                            <Typography variant="h5" color="secondary.dark">{alphabet[analysisLegends.kea]}. Kinase Enrichment Analysis</Typography>
                                            <KEABarChart data={analysisData[geneset.id]['keaResults']} />
                                            <Typography variant='caption' color='black' sx={{ wordWrap: 'break-word', padding: 2 }}>
                                                <strong>Figure {figureLegends.kea[i]}.</strong> Kinase enrichment analysis results of the {geneset.name} gene set showing top 10 ranked kinases
                                                across libraries based on two different metrics. The MeanRank bar chart is color-coded by
                                                library; hover over a colored bar segment to view individual library rankings for a given kinase.
                                                The TopRank bar chart displays the TopRank score for each of the top-ranking kinases.
                                            </Typography>
                                        </Stack>
                                    }
                                    {(analysisData[geneset.id] && analysisOptions.chea) &&
                                        <Stack direction='column'>
                                            <Typography variant="h5" color="secondary.dark">{alphabet[analysisLegends.chea]}. Transciption Factor Enrichment Analysis</Typography>
                                            <CHEABarChart data={analysisData[geneset.id]['cheaResults']} />
                                            <Typography variant='caption' color='black' sx={{ wordWrap: 'break-word', padding: 2 }}>
                                                <strong>Figure {figureLegends.chea[i]}.</strong> Transcription factor enrichment analysis results of the {geneset.name} gene set showing top 10 ranked TFs
                                                across libraries.
                                            </Typography>
                                        </Stack>
                                    }
                                </Stack>
                                <List sx={{ listStyleType: 'disc', marginLeft: 5 }}>
                                    {(analysisData[geneset.id] && analysisOptions.sigcom) &&
                                        <ListItem sx={{ display: 'list-item' }}>
                                            SigCom LINCS Link: <Link color='secondary'>{analysisData[geneset.id] ? analysisData[geneset.id]['sigcomLink'] : ''}</Link>
                                        </ListItem>
                                    }
                                    {(analysisData[geneset.id] && analysisOptions.rummagene) &&
                                        <ListItem sx={{ display: 'list-item' }}>
                                            Rummagene Link: <Link color='secondary'>{analysisData[geneset.id] ? analysisData[geneset.id]['rummageneLink'] : ''}</Link>
                                        </ListItem>
                                    }
                                    {(analysisData[geneset.id] && analysisOptions.rummageo) &&
                                        <ListItem sx={{ display: 'list-item' }}>
                                            RummaGEO Link: <Link color='secondary'>{analysisData[geneset.id] ? analysisData[geneset.id]['rummageoLink'] : ''}</Link>
                                        </ListItem>
                                    }
                                </List>
                            </ListItem>
                        )}
                    </List>
                    {analysisData.gptSummary &&
                        <Box sx={{ marginLeft: 3, marginTop: 2 }}>
                            <Typography variant="h5" color="secondary.dark" sx={{ borderBottom: 1 }}>GPT GENERATED SUMMARY</Typography>
                            <Typography variant='body2' color='black' sx={{ marginLeft: 3, marginTop: 1 }}>
                                {analysisData['gptSummary']}
                            </Typography>
                        </Box>
                    }
                </Paper>
            </div>
        </>
    )
}