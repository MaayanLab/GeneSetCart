import React from "react";
import { Stack } from "@mui/material";
import Plot from 'react-plotly.js';


export function BarChart({ terms, pvalues, library, order, markerOptions, xTitle, yTitle }: { terms: string[], pvalues: number[], library: string, order: string, markerOptions: any, xTitle: string, yTitle: string }) {
    const data: any =
        [
            {
                type: 'bar',
                x: pvalues,
                y: terms, orientation: 'h',
                text: terms.map((term)=> formatPlotText(term)),
                marker: markerOptions,
            },
        ]
    const layout = {
        title: library,
        yaxis: {
            showticklabels: false,
            categoryorder: order as any,
            title: {
                text: yTitle,
                font: {
                    size: 18,
                }
            }
        },
        xaxis: {
            title: {
                text: xTitle,
                font: {
                    size: 14,
                }
            },
        }
    };

    return <Plot data={data} layout={layout} />;
}

export function StackedBarChart({ plotData, title, xTitle, yTitle }: { plotData: any, title: string, xTitle: string, yTitle: string }) {
    const data = plotData
    const layout = {
        title: title,
        yaxis: {
            categoryorder: "total descending" as any,
            yTitle: yTitle
        },
        xaxis: {
            title: {
                text: xTitle,
                font: {
                    size: 14,
                }
            },
        },
        barmode: 'stack' as any
    };

    return <Plot data={data} layout={layout} />;
}

export function EnrichrResults({ data }: { data: any }) {
    const libraries = ['WikiPathway_2023_Human', 'GO_Biological_Process_2023']
    // const libraries = ['WikiPathway_2023_Human', 'GWAS_Catalog_2023', 'GO_Biological_Process_2023', 'MGI_Mammalian_Phenotype_Level_4_2021',]
    const barPlots = libraries.map((library, i) => {
        const libraryData = data[library]
        const terms = libraryData.map((enrichedTermResult: any[]) => enrichedTermResult[1])
        const pvalues = libraryData.map((enrichedTermResult: any[]) => enrichedTermResult[2])
        const markerOptions = {
            color: 'rgb(245, 87, 66)',
            opacity: 0.6,
            line: {
                color: 'rgb(176, 73, 60)',
                width: 1.5
            }
        }
        return (
            <div style={{ breakInside: 'avoid' }} key={i}>
                <BarChart terms={terms.map((terms: string, i: number) => {
                    return terms + ' (p=' + pvalues[i].toExponential(2).toString() + ')'
                })}
                    pvalues={pvalues.map((pvalue: number) => -Math.log10(pvalue))}
                    library={library} order={"total ascending"}
                    markerOptions={markerOptions}
                    xTitle="-Log(P-value)"
                    yTitle=""
                />
            </div>
        )
    }
    )
    return barPlots
}

export function KEABarChart({ data }: { data: any }) {
    const topRankTerms = data.topRank.map((kinaseInfo: any) => kinaseInfo.TF)
    const topRankScores = data.topRank.map((kinaseInfo: any) => kinaseInfo.Score)
    const meanRankTFs = data.meanRank.map((kinaseInfo: any) => kinaseInfo.TF)
    const rankData: { [key: string]: number[] } = { 'STRING.bind': [], 'ChengPPI': [], 'PhosDAll': [], 'BioGRID': [], 'HIPPIE': [], 'ChengKSIN': [], 'STRING': [], 'MINT': [], 'mentha': [], 'prePPI': [], 'PTMsigDB': [] }
    data.meanRank.map((kinaseInfo: any) => {
        const libraryRanks: string[] = kinaseInfo['Library'].split(';')
        libraryRanks.map((libInfo) => {
            rankData[libInfo.split(',')[0] as string].push(parseInt(libInfo.split(',')[1]))
        })
    })
    const stackedChartData: any = Object.keys(rankData).map((libData) => {
        {
            return {
                y: meanRankTFs,
                x: rankData[libData],
                name: libData,
                type: 'bar',
                orientation: 'h'
            }
        }

    })
    const markerOptions = {
        color: 'rgb(158,202,225)',
        opacity: 0.6,
        line: {
            color: 'rgb(8,48,107)',
            width: 1.5
        }
    }
    return (
        <Stack direction='column'>
            <div style={{ breakInside: 'avoid' }}>
                <BarChart terms={topRankTerms} pvalues={topRankScores} library={'TopRank Score'} order={"total descending"} markerOptions={markerOptions} xTitle="TopRank Score" yTitle="" />
            </div>
            <div style={{ breakInside: 'avoid' }}>
                <StackedBarChart plotData={stackedChartData} title={'MeanRank Score'} xTitle={'Sum of Ranks'} yTitle="" />
            </div>
        </Stack>
    )
}

export function CHEABarChart({ data }: { data: any }) {
    const meanRankTFs = data.meanRank.map((kinaseInfo: any) => kinaseInfo.TF)
    const rankData: { [key: string]: number[] } = { 'ARCHS4 Coexpression': [], 'ENCODE ChIP-seq': [], 'Enrichr Queries': [], 'ReMap ChIP-seq': [], 'GTEx Coexpression': [], 'Literature ChIP-seq': [] }
    const sources = Object.keys(rankData)
    data.meanRank.map((kinaseInfo: any) => {
        const libraryRanks: string[] = kinaseInfo['Library'].split(';')
        const presentLibs = libraryRanks.map((libInfo) => libInfo.split(',')[0] as string)
        libraryRanks.map((libInfo) => {
            rankData[libInfo.split(',')[0] as string].push(parseInt(libInfo.split(',')[1]))
        })
        sources.forEach((source) => {
            if (!presentLibs.includes(source)) {
                rankData[source].push(0)
            }
        })
    })
    const stackedChartData: any = Object.keys(rankData).map((libData) => {
        {
            return {
                y: meanRankTFs,
                x: rankData[libData],
                name: libData,
                type: 'bar',
                orientation: 'h'
            }
        }
    })
    return (
        <div style={{ breakInside: 'avoid' }}>
            <StackedBarChart plotData={stackedChartData} title={'MeanRank Score'}  xTitle="Sum of Ranks" yTitle=''/>
        </div>
    )
}

function formatPlotText(text: string) {
    return text.substring(0, 40) + '<br>' + text.substring(40)
}