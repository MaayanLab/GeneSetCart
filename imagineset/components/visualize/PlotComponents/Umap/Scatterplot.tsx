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
};

type ScatterplotProps = {
    width: number;
    height: number;
    data: DataPoint[];
};

// Simplified version of a scatterplot
export const Scatterplot = ({ width, height, data }: ScatterplotProps) => {
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
        .range(["#e0ac2b", "#e85252", "#6689c6", "#9a6fb0", "#a53253", "#5fe8b2", "#cba5c4", "#36209e", "#9801aa"]);

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
                    })
                    setHoveredGroup(d.group)
                }
                }
                onMouseLeave={() => { setHovered(null); setHoveredGroup(null) }}
            />
        );
    });

    const legendgroups = Array.from(new Set(allGroups))
    const legends = legendgroups.map((l, i) => {
        return (
            <text
                fill={colorScale(l)}
                y={0 + i * 20}
                onMouseEnter={() => setHoveredGroup(l)}
                onMouseLeave={() => setHoveredGroup(null)}
            >
                {l}
            </text>
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
                    transform={`translate(${[MARGIN.left + boundsWidth, (MARGIN.top + boundsHeight) / 2].join(",")})`}>
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
