import * as d3 from "d3";
import styles from "./scatterplot.module.css";
import { AxisLeft } from "./AxisLeft";
import { AxisBottom } from "./AxisBottom";
import { useState } from "react";
import { InteractionData, Tooltip } from "./Tooltip";

export const MARGIN = { top: 60, right: 80, bottom: 60, left: 60 };

export type DataPoint = {
    x: number;
    y: number;
    group: string;
    subGroup: string;
    genes: string[];
};

type ScatterplotProps = {
    width: number;
    height: number;
    data: DataPoint[];
    setOverlap: React.Dispatch<React.SetStateAction<string[]>>
};

// Simplified version of a scatterplot
export const Scatterplot = ({ width, height, data, setOverlap }: ScatterplotProps) => {
    const boundsWidth = width - MARGIN.right - MARGIN.left;
    const boundsHeight = height - MARGIN.top - MARGIN.bottom;

    const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
    const [hovered, setHovered] = useState<InteractionData | null>(null);


    // Scales
    const ys = data.map((point) => point.y)
    const yScale = d3.scaleLinear().domain([Math.min(...ys) - 3, Math.max(...ys) + 3]).range([boundsHeight, 0]);
    const xScale = d3
        .scaleLinear()
        .domain([Math.min(...data.map((point) => point.x)) - 3, Math.max(...data.map((point) => point.x)) + 3])
        .range([0, boundsWidth]);
    const allGroups = data.map((d) => String(d.group));
    const colorScale = d3
        .scaleOrdinal<string>()
        .domain(allGroups)
        .range(["#e0ac2b", "#e85252", "#6689c6", "#9a6fb0", "#a53253", "#5fe8b2", "#cba5c4", "#36209e", "#9801aa", "#A07A19", "#AC30C0", "#EB9A72", "#BA86F5", "#EA22A8", "#78b98f", "#0b6d33", "#4ae182", "#344b46", "#20d8fd", "#3e69b6", "#421ec8", "#d45fea", "#793883", "#79acfd", "#cb1775", "#fe16f4", "#b1d34f", "#6e3901", "#e4bfab", "#f24219", "#fea53b", "#900e08", "#e5808e", "#a07d62", "#84ee15"]);

    // Build the shapes
    const allShapes = data.map((d, i) => {
        const className =
            hoveredGroup && d.group !== hoveredGroup
                ? styles.scatterplotCircle + " " + styles.dimmed
                : styles.scatterplotCircle;

        return (
            <circle
                key={i}
                r={5}
                cx={xScale(d.x)}
                cy={yScale(d.y)}
                className={className}
                stroke={colorScale(d.group)}
                fill={colorScale(d.group)}
                onMouseEnter={() => {
                    setHovered({
                        xPos: xScale(d.x),
                        yPos: yScale(d.y),
                        name: d.subGroup,
                        color: colorScale(d.group),
                        group: d.group
                    })
                    setHoveredGroup(d.group)
                }
                }
                onMouseLeave={() => { setHovered(null); setHoveredGroup(null) }}
                onMouseDown={() => setOverlap(d.genes)}
            />
        );
    });

    // build the legends
    const legendgroups = Array.from(new Set(allGroups))
    const legends = legendgroups.sort((a, b) => {
        if (a < b) return -1
        else if (a > b) return 1
        else return 0
    }).map((l, i) => {
        return (
            <text
                key={i + 'text'}
                fill={colorScale(l)}
                x={10}
                y={0 + i * 20}
                fontSize={12}
                onMouseEnter={() => setHoveredGroup(l)}
                onMouseLeave={() => setHoveredGroup(null)}
            >
                {l}
            </text>
        )
    })

    // build the legendsCircles
    const legendCircles = legendgroups.sort((a, b) => {
        if (a < b) return -1
        else if (a > b) return 1
        else return 0
    }).map((l, i) => {
        return (
            <circle
                key={i}
                r={5}
                cx={0}
                cy={-4 + i * 20}
                stroke={colorScale(l)}
                fill={colorScale(l)}
                onMouseEnter={() => setHoveredGroup(l)}
                onMouseLeave={() => setHoveredGroup(null)}
            />
        )
    })

    return (
        <div>
            <svg width={width} height={height} id='svg'>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                >
                    {/* Y axis */}
                    <AxisLeft yScale={yScale} pixelsPerTick={40} width={boundsWidth} />

                    {/* X axis, use an additional translation to appear at the bottom */}
                    <g transform={`translate(0, ${boundsHeight})`}>
                        <AxisBottom
                            xScale={xScale}
                            pixelsPerTick={40}
                            height={boundsHeight}
                        />
                    </g>

                    {/* Circles */}
                    {allShapes}
                </g>
                <g
                    width={100}
                    height={60}
                    transform={`translate(${[MARGIN.left + boundsWidth, MARGIN.top].join(",")})`}>
                    {legendCircles}
                    {legends}
                </g>
            </svg>
            {/* Tooltip */}
            <div
                style={{
                    width: boundsWidth,
                    height: boundsHeight,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                    marginLeft: MARGIN.left + MARGIN.right,
                    marginTop: MARGIN.top,
                }}
            >
                <Tooltip interactionData={hovered} />
            </div>
        </div>
    );
};
