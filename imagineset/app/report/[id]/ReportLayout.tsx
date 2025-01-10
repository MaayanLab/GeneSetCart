'use client'

import { type Gene, type GeneSet } from "@prisma/client";
import React from "react";
import { Button, Fade, Stack, Typography } from "@mui/material";
import { GeneSetSelect } from "./GenesetSelect";
import ArticleIcon from '@mui/icons-material/Article';

import dynamic from "next/dynamic";
import { EnrichmentAnalysisSelection, VisualizationSelection } from "./AnalysesSelection";
import CircularIndeterminate from "@/components/misc/Loading";
import { getAnalysisData } from "./fetchData";
import { JsonObject } from "@prisma/client/runtime/library";

const Report = dynamic(() => import("./Report"), {
    ssr: false,
});

export type visualizationOptions = {
    venn: boolean;
    upset: boolean;
    supervenn: boolean;
    heatmap: boolean;
    umap: boolean;
}

export type analysisOptions = {
    enrichr: boolean;
    kea: boolean;
    chea: boolean;
    sigcom: boolean;
    rummagene: boolean;
    rummageo: boolean;
    playbook: boolean;
    l2s2: boolean;
    pfocr: boolean;
}

export function ReportLayout({ sessionInfo, sessionId }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    sessionId: string
}) {

    const [checked, setChecked] = React.useState<number[]>([]);
    const [displayReport, setDisplayReport] = React.useState(false)
    const [visualizationOptions, setVisualizationOptions] = React.useState({ venn: true, upset: true, supervenn: true, heatmap: true, umap: true })
    const [analysisOptions, setAnalysisOptions] = React.useState({ enrichr: true, kea: true, chea: true, sigcom: true, rummagene: true, rummageo: true, playbook: true, l2s2: true, pfocr: true })
    const [loading, setLoading] = React.useState(false)
    const [analysisData, setAnalysisData] = React.useState<JsonObject>({})
    const [errorMessage , setErrorMessage] = React.useState('')


    React.useEffect(() => { 
        if (errorMessage.length > 0) {
            setTimeout(() => { setErrorMessage('') }, 3000)
        }
    }, [errorMessage, setErrorMessage])

    const selectedSets = React.useMemo(() => {
        if (checked.length > 5) {
            setAnalysisOptions({ enrichr: false, kea: false, chea: false, sigcom: false, rummagene: false, rummageo: false, playbook: false, l2s2: false, pfocr: false })
        }
        setAnalysisData({})
        setDisplayReport(false)
        const typedSets = sessionInfo ? sessionInfo.gene_sets : []
        const checkedSets = typedSets.filter((set, index) => checked.includes(index))
        return checkedSets
    }, [checked, sessionInfo?.gene_sets])

    React.useEffect(() => {
        setAnalysisData({})
        setDisplayReport(false)
    }, [analysisOptions, visualizationOptions])

    const disabledVisualizations = React.useMemo(() => {
        let disabledOptions = { venn: false, upset: false, supervenn: false, heatmap: false, umap: false }
        if (selectedSets.length === 0) {
            disabledOptions = { venn: true, upset: true, supervenn: true, heatmap: true, umap: true }
        } else {
            if (selectedSets.length > 6) {
                disabledOptions = { ...disabledOptions, venn: true, upset: true }
            }
            if (selectedSets.length > 11) {
                disabledOptions = { ...disabledOptions, supervenn: true }
            }
            if (selectedSets.length < 5) {
                disabledOptions = { ...disabledOptions, umap: true }
            }
            if (selectedSets.length < 2) {
                disabledOptions = { ...disabledOptions, heatmap: true, venn: true }
            }
        }
        return disabledOptions
    }, [selectedSets])

    return (
        <Stack direction='column' spacing={1} justifyContent="center" alignItems="center">
            <GeneSetSelect sessionInfo={sessionInfo} checked={checked} setChecked={setChecked} selectedSets={selectedSets} />
            <Typography variant="h4" color='secondary'> CHOOSE VISUALIZATION OPTIONS</Typography>
            <VisualizationSelection visualizationOptions={visualizationOptions} setVisualizationOptions={setVisualizationOptions} disabledVisualizations={disabledVisualizations} errorMessage = {errorMessage} setErrorMessage = {setErrorMessage}  />
            <Typography variant="h4" color='secondary'> CHOOSE ENRICHMENT ANALYSIS TOOLS OPTIONS</Typography>
            <EnrichmentAnalysisSelection analysisOptions={analysisOptions} setAnalysisOptions={setAnalysisOptions} selectedSetsCount = {selectedSets.length} errorMessage = {errorMessage} setErrorMessage = {setErrorMessage} />
                <Button
                    variant='contained'
                    color='secondary'
                    className="mb-10"
                    disabled={selectedSets.length < 1}
                    onClick={() => { 
                        setAnalysisData({}); 
                        setDisplayReport(false)
                        setLoading(true); 
                        getAnalysisData(selectedSets, analysisOptions, visualizationOptions).then((result) => {
                            setAnalysisData(result)
                            setLoading(false)
                            setDisplayReport(true)
                        }) 
                        }}>
                    <ArticleIcon /> &nbsp; Generate Report
                </Button>
           <Fade in={errorMessage.length > 0} timeout={500}>
                <Typography variant="body2" color='error' sx={{ position: 'absolute', bottom: -200, backgroundColor: '#fc6156'
                    , borderRadius: 2, padding: 1, width: '30%', textAlign: 'center', color: 'white', fontWeight: 'bold'
                }}>{errorMessage}</Typography>
            </Fade>
            {loading && <Stack direction='column' sx={{ justifyContent: 'center' }}>
            
                <Typography variant="body2" color='secondary'>Generating Report...</Typography>
                <CircularIndeterminate />
            </Stack>}
            {(!loading && displayReport) &&
                <Report selectedSets={selectedSets}
                    checked={checked}
                    sessionId={sessionId}
                    visualizationOptions={visualizationOptions}
                    disabledOptions={disabledVisualizations}
                    analysisData={analysisData}
                    analysisOptions={analysisOptions} />}
        </Stack>
    )
}