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
import SigcomLincsLogo from "@/public/img/otherLogos/sigcomLincsLogo.svg"
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
                    <Button variant='outlined' color={visualizationOptions.venn ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
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
                    <Button variant='outlined' color={visualizationOptions.supervenn ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
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
                    <Button variant='outlined' color={visualizationOptions.upset ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
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
                    <Button variant='outlined' color={visualizationOptions.heatmap ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
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
                    <Button variant='outlined' color={visualizationOptions.umap ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
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

export function EnrichmentAnalysisSelection({ analysisOptions, setAnalysisOptions, disabled }: { analysisOptions: analysisOptions, setAnalysisOptions: React.Dispatch<React.SetStateAction<analysisOptions>>, disabled: boolean }) {
    return (
        <Stack direction='row' spacing={3} sx={{ justifyContent: 'center' }} useFlexGap flexWrap="wrap">
            <Tooltip title={"Enrichment analysis results of the genes via Enrichr"} placement="top">
                <div>
                    <Button variant='outlined' color={analysisOptions.enrichr ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, enrichr: !analysisOptions.enrichr })} disabled={disabled}
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
                    <Button variant='outlined' color={analysisOptions.kea ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, kea: !analysisOptions.kea })} disabled={disabled}
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
                    <Button variant='outlined' color={analysisOptions.chea ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, chea: !analysisOptions.chea })} disabled={disabled}
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
                    <Button variant='outlined' color={analysisOptions.sigcom ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, sigcom: !analysisOptions.sigcom })} disabled={disabled}
                    >
                        <SigcomLincsLogo />
                    </Button>

                </div>
            </Tooltip>
            <Tooltip title={"Identify most similar gene sets extracted from supporting tables of PubMed articles"} placement="top">
                <div>
                    <Button variant='outlined' color={analysisOptions.rummagene ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, rummagene: !analysisOptions.rummagene })} disabled={disabled}
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
                    <Button variant='outlined' color={analysisOptions.rummageo ? 'success' : 'error'} sx={{ height: 100, width: 100, border: 1.5, borderRadius: 2 }}
                        onClick={(event) => setAnalysisOptions({ ...analysisOptions, rummageo: !analysisOptions.rummageo })} disabled={disabled}
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
        </Stack>
    )
}