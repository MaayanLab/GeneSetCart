'use client'
import * as d3 from "d3";
import React from "react";
import { Tooltip } from "./Tooltip";
import { Renderer } from "./Renderer";
import { ColorLegend } from "./ColorLegend";
import { COLOR_LEGEND_HEIGHT, THRESHOLDS } from "./Constants";
import { Gene } from "@prisma/client";
import { OverlapSelection } from "@/app/visualize/[id]/VisualizeLayout";
import { getClustermap, getClustermapClasses } from "./getClustermap";

// code adapted from https://www.react-graph-gallery.com/heatmap
export type HeatmapProps = {
    width: number;
    height: number;
    legendSelectedSets: {
        alphabet: string;
        genes: Gene[];
        id: string;
        name: string;
        description: string | null;
        session_id: string;
        createdAt: Date;
    }[];
    setOverlap: React.Dispatch<React.SetStateAction<OverlapSelection>>;
};

export type InteractionData = {
    xLabel: string;
    yLabel: string;
    xPos: number;
    yPos: number;
    value: number;
    overlap: string[]
};


function jaccard_similarity(set1: string[], set2: string[]) {
    const union = Array.from(new Set([...set1, ...set2]))
    const intersection = set1.filter(function (n) {
        return set2.indexOf(n) !== -1;
    });

    return intersection.length / union.length
}

export const Heatmap = ({ width, height, legendSelectedSets, setOverlap }: HeatmapProps) => {
    const [clusteredGroups, setClusteredGroups] = React.useState<{ [key: string]: string } | null>()
    const [clusterClassesCount, setClusteredClassesCount] = React.useState<{ [key: string]: number } | null>()
    React.useEffect(() => {
        getClustermapClasses(legendSelectedSets)
            .then((clusteredClasses) => {
                console.log(clusteredClasses)
                if (legendSelectedSets) {
                    const yGroups: { [key: string]: string } = {}
                    legendSelectedSets.forEach((geneset, i) => {
                        const cluster = Object.keys(clusteredClasses).filter((item) => clusteredClasses[item].includes(geneset.alphabet))[0]
                        yGroups[geneset.alphabet] = cluster
                    })
                    setClusteredGroups(yGroups)

                    const clusterCount : {[key: string]: number} = {}
                    Object.keys(clusteredClasses).forEach((cluster: any) => {
                            clusterCount[cluster] = clusteredClasses[cluster].length
                    })
                    setClusteredClassesCount(clusterCount)
                } else {
                    setClusteredGroups(null)
                }
            })
    }, [legendSelectedSets])

    const data = React.useMemo(() => {
        if (legendSelectedSets && clusteredGroups) {
            const items = Object.keys(clusteredGroups).map(
                (key) => { return [key, clusteredGroups[key]] });
            items.sort(
                (first: string[], second: string[]) => { 
                    if (first[1] > second[1]) {
                        return 1
                    }  if (first[1] < second[1]) {
                        return -1
                    } else {
                        return 0
                    }
                }
            );
            const keys = items.map(
                (e) => { return e[0] });
            const sortedLegendSets = legendSelectedSets.sort((a,b) => {
                if (keys.indexOf(a.alphabet) > keys.indexOf(b.alphabet)) {
                    return 1
                } else if (keys.indexOf(a.alphabet) < keys.indexOf(b.alphabet)) {
                    return -1
                } else {
                    return 0
                }
            })
            const dataArrays = sortedLegendSets.map((geneset, i) => {
                let genesetRow: { x: string; y: string; value: number, overlap: string[] }[] = []
                for (let [n, innerLoop] of sortedLegendSets.entries()) {
                    const x = geneset.name
                    const y = innerLoop.name
                    const xyJaccard = (x !== y) ? jaccard_similarity(geneset.genes.map((gene) => gene.gene_symbol), innerLoop.genes.map((gene) => gene.gene_symbol)) : 0
                    const geneset1 = geneset.genes.map((gene) => gene.gene_symbol)
                    const geneset2 = innerLoop.genes.map((gene) => gene.gene_symbol)
                    const overlap = (x !== y) ? geneset1.filter((x) => geneset2.includes(x)) : []
                    genesetRow.push({ x: geneset.alphabet, y: innerLoop.alphabet, value: xyJaccard, overlap: overlap })
                }
                return genesetRow
            })
            return dataArrays.flat()
        } else {
            return []
        }
    }, [legendSelectedSets, clusteredGroups])

    const [hoveredCell, setHoveredCell] = React.useState<InteractionData | null>(null);
    // Color scale is computed here bc it must be passed to both the renderer and the legend
    const values = data ? data
        .map((d) => d.value)
        .filter((d): d is number => d !== null) : [];
    const max = d3.max(values) || 1;

    const colorScale = d3
        // .scaleLinear<string>()
        .scaleSequential()
        .interpolator(d3.interpolateViridis)
        .domain([0, max])
        // .range(["lightblue", "purple"]);

    return (
        <div style={{ position: "relative" }}>
            <Renderer
                width={width}
                height={height}
                data={data ? data : []}
                setHoveredCell={setHoveredCell}
                setOverlap={setOverlap}
                colorScale={colorScale}
                clusterClasses={clusterClassesCount ? clusterClassesCount : {}}
            />
            <Tooltip interactionData={hoveredCell} width={width} height={height} />
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <ColorLegend
                    height={COLOR_LEGEND_HEIGHT}
                    width={200}
                    colorScale={colorScale}
                    interactionData={hoveredCell}
                />
            </div>
        </div>
    );
};
