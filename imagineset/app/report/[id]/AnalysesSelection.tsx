import { Stack, Tooltip, Button, } from "@mui/material";
import Image from 'next/image';
import vennIcon from '@/public/img/otherLogos/VennDagramIcon.png'
import superVennIcon from '@/public/img/otherLogos/supervennIcon.png'
import heatmapIcon from '@/public/img/otherLogos/visualizeIcon.png'
import umapIcon from '@/public/img/otherLogos/umapPlot2.png'
import upsetIconAlt from '@/public/img/otherLogos/plotly-upset-alt.png'
import enrichrLogo from "@/public/img/otherLogos/enrichrIcon.png"
import rummageneLogo from "@/public/img/otherLogos/rummageneLogo.png"
import rummageoLogo from "@/public/img/otherLogos/rummageoLogo.webp"
import kea3Logo from "@/public/img/otherLogos/KEA3Logo.png"
import chea3logo from "@/public/img/otherLogos/chea3Logo.png"
import SigcomLincsLogo from "@/public/img/otherLogos/sigcomlincs.png"
import playbookLogo from "@/public/img/otherLogos/playbook-workflow-builder.png"
import { analysisOptions, visualizationOptions } from "./ReportLayout";


export function VisualizationSelection({ visualizationOptions, setVisualizationOptions, disabledVisualizations }:
    {
        visualizationOptions: visualizationOptions,
        setVisualizationOptions: React.Dispatch<React.SetStateAction<visualizationOptions>>,
        disabledVisualizations: visualizationOptions
    }) {
    return (
        <Stack direction='row' spacing={3} sx={{ justifyContent: 'center' }} useFlexGap flexWrap="wrap">
            <Tooltip title={"Can visualize 2 - 5 selected sets"} placement="top">
                <div>
                    <Button variant='outlined' color={visualizationOptions.venn ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setVisualizationOptions({ ...visualizationOptions, venn: !visualizationOptions.venn })} disabled={disabledVisualizations.venn}
                    >
                        <Image
                            src={vennIcon}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
            <Tooltip title={"Can visualize 1 - 10 selected sets "} placement="top">
                <div>
                    <Button variant='outlined' color={visualizationOptions.supervenn ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setVisualizationOptions({ ...visualizationOptions, supervenn: !visualizationOptions.supervenn })} disabled={disabledVisualizations.supervenn}

                    >
                        <Image
                            src={superVennIcon}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
            <Tooltip title={"Can visualize 1 - 6 selected sets"} placement="top">
                <div>
                    <Button variant='outlined' color={visualizationOptions.upset ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setVisualizationOptions({ ...visualizationOptions, upset: !visualizationOptions.upset })} disabled={disabledVisualizations.upset}
                    >
                        <Image
                            src={upsetIconAlt}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
            <Tooltip title={"Can visualize > 1 selected sets "} placement="top">
                <div>
                    <Button variant='outlined' color={visualizationOptions.heatmap ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setVisualizationOptions({ ...visualizationOptions, heatmap: !visualizationOptions.heatmap })} disabled={disabledVisualizations.heatmap}
                    >
                        <Image
                            src={heatmapIcon}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
            <Tooltip title={"Can visualize > 5 selected sets "} placement="top">
                <div>
                    <Button variant='outlined' color={visualizationOptions.umap ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setVisualizationOptions({ ...visualizationOptions, umap: !visualizationOptions.umap })} disabled={disabledVisualizations.umap}
                    >
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
    )
}

export function EnrichmentAnalysisSelection({ analysisOptions, setAnalysisOptions, selectedSetsCount }: { analysisOptions: analysisOptions, setAnalysisOptions: React.Dispatch<React.SetStateAction<analysisOptions>>, selectedSetsCount: number }) {
    return (
        <Stack direction='row' spacing={3} sx={{ justifyContent: 'center' }} useFlexGap flexWrap="wrap">
            <Tooltip title={"Enrichment analysis results of the genes via Enrichr"} placement="top">
                <div>
                    <Button variant='outlined' color={analysisOptions.enrichr ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, enrichr: !analysisOptions.enrichr })} disabled={(selectedSetsCount === 0) || (selectedSetsCount > 3)}
                    >
                        <Image
                            src={enrichrLogo}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
            <Tooltip title={"Identifies protein kinases whose substrates are enriched in the genes"} placement="top">
                <div>
                    <Button variant='outlined' color={analysisOptions.kea ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, kea: !analysisOptions.kea })} disabled={(selectedSetsCount === 0) || (selectedSetsCount > 3)}
                    >
                        <Image
                            src={kea3Logo}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
            <Tooltip title={"Identifies transcription factors whose targets are enriched in the genes"} placement="top">
                <div>
                    <Button variant='outlined' color={analysisOptions.chea ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, chea: !analysisOptions.chea })} disabled={(selectedSetsCount === 0) || (selectedSetsCount > 3)}
                    >
                        <Image
                            src={chea3logo}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
            <Tooltip title={"Identify perturbations from over 1 million signatures that maximally up- or down-regulate the expression of the gene sets"} placement="top">
                <div>
                    <Button variant='outlined' color={analysisOptions.sigcom ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, sigcom: !analysisOptions.sigcom })} disabled={(selectedSetsCount === 0) || (selectedSetsCount > 3)}
                    >
                        <Image
                            src={SigcomLincsLogo}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>

                </div>
            </Tooltip>
            <Tooltip title={"Identify most similar gene sets extracted from supporting tables of PubMed articles"} placement="top">
                <div>
                    <Button variant='outlined' color={analysisOptions.rummagene ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, rummagene: !analysisOptions.rummagene })} disabled={(selectedSetsCount === 0) || (selectedSetsCount > 3)}
                    >
                        <Image
                            src={rummageneLogo}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
            <Tooltip title={"Identify most similar signatures from GEO studies to your gene sets"} placement="top">
                <div>
                    <Button variant='outlined' color={analysisOptions.rummageo ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, rummageo: !analysisOptions.rummageo })} disabled={(selectedSetsCount === 0) || (selectedSetsCount > 3)}
                    >
                        <Image
                            src={rummageoLogo}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
            <Tooltip title={"Create analysis workflow from gene sets in the Playbook Workflow Builder"} placement="top">
                <div>
                    <Button variant='outlined' color={analysisOptions.playbook ? 'success' : 'primary'} sx={{ height: 100, width: 100, border: 3, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, playbook: !analysisOptions.playbook })} disabled={(selectedSetsCount === 0)}
                    >
                        <Image
                            src={playbookLogo}
                            fill
                            alt=""
                            style={{ padding: "10%", objectFit: "contain" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </Button>
                </div>
            </Tooltip>
        </Stack>
    )
}