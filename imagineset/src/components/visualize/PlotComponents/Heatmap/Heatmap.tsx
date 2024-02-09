'use client'
import * as d3 from "d3";
import React from "react";
import { Tooltip } from "./Tooltip";
import { Renderer } from "./Renderer";
import { ColorLegend } from "./ColorLegend";
import { COLOR_LEGEND_HEIGHT, THRESHOLDS } from "./Constants";

// code extracted from https://www.react-graph-gallery.com/heatmap
export type HeatmapProps = {
    width: number;
    height: number;
    data: { x: string; y: string; value: number }[];
};

export type InteractionData = {
    xLabel: string;
    yLabel: string;
    xPos: number;
    yPos: number;
    value: number;
};

export const Heatmap = ({ width, height, data }: HeatmapProps) => {
    const [hoveredCell, setHoveredCell] = React.useState<InteractionData | null>(null);

    // Color scale is computed here bc it must be passed to both the renderer and the legend
    const values = data
        .map((d) => d.value)
        .filter((d): d is number => d !== null);
    const max = d3.max(values) || 0;

    const colorScale = d3
        .scaleLinear<string>()
        .domain([0, max])
        .range(["lightblue", "purple"]);

    return (
        <div style={{ position: "relative" }}>
            <Renderer
                width={width}
                height={height}
                data={data}
                setHoveredCell={setHoveredCell}
                colorScale={colorScale}
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
