'use client'

import { type Gene, type GeneSet } from "@prisma/client";
import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import { GeneSetSelect } from "./GenesetSelect";
import ArticleIcon from '@mui/icons-material/Article';

import dynamic from "next/dynamic";
import { EnrichmentAnalysisSelection, VisualizationSelection } from "./AnalysesSelection";
import CircularIndeterminate, { LinearIndeterminate } from "@/components/misc/Loading";
import { getAnalysisData } from "./fetchData";

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
    const [analysisOptions, setAnalysisOptions] = React.useState({ enrichr: true, kea: true, chea: true, sigcom: true, rummagene: true, rummageo: true })
    const [loading, setLoading] = React.useState(false)
    const [analysisData, setAnalysisData] = React.useState<any>({})

    const selectedSets = React.useMemo(() => {
        setDisplayReport(false);
        const typedSets = sessionInfo ? sessionInfo.gene_sets : []
        const checkedSets = typedSets.filter((set, index) => checked.includes(index))
        return checkedSets
    }, [checked, sessionInfo?.gene_sets])

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

    React.useEffect(() => {
        if (displayReport === true) {
            getAnalysisData(selectedSets, analysisOptions).then((result) => {
                setAnalysisData(result)
                setLoading(false)
            })
        }
    }, [selectedSets, analysisOptions, displayReport])

    return (
        <Stack direction='column' spacing={1} justifyContent="center" alignItems="center">
            <GeneSetSelect sessionInfo={sessionInfo} checked={checked} setChecked={setChecked} selectedSets={selectedSets} />
            <Typography variant="h4" color='secondary'> CHOOSE VISUALIZATION OPTIONS</Typography>
            <VisualizationSelection visualizationOptions={visualizationOptions} setVisualizationOptions={setVisualizationOptions} disabledVisualizations={disabledVisualizations} />
            <Typography variant="h4" color='secondary'> CHOOSE ENRICHMENT ANALYSIS TOOLS OPTIONS</Typography>
            <EnrichmentAnalysisSelection analysisOptions={analysisOptions} setAnalysisOptions={setAnalysisOptions} disabled={selectedSets.length === 0} />
            <Button
                variant='contained'
                fullWidth
                color='secondary'
                disabled={selectedSets.length < 1}
                onClick={() => { setDisplayReport(true); setLoading(true) }}>
                <ArticleIcon /> &nbsp; Generate Report
            </Button>
            {loading && <Stack direction='column' sx={{ justifyContent: 'center' }}>
                <Typography variant="body2" color='secondary'>Generating Report...</Typography>
                <CircularIndeterminate />
            </Stack>}
            {displayReport && !loading && <Report selectedSets={selectedSets} checked={checked} sessionId={sessionId} visualizationOptions={visualizationOptions} disabledOptions={disabledVisualizations} analysisData={analysisData} analysisOptions={analysisOptions} />}
        </Stack>

    )
}