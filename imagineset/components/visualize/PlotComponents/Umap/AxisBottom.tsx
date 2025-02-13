import { useMemo } from "react";
import { ScaleLinear } from "d3";
import { MARGIN } from "./Scatterplot";

type AxisBottomProps = {
    xScale: ScaleLinear<number, number>;
    pixelsPerTick: number;
    height: number;
};

// tick length
const TICK_LENGTH = 10;

export const AxisBottom = ({
    xScale,
    pixelsPerTick,
    height,
}: AxisBottomProps) => {
    const range = xScale.range();

    const ticks = useMemo(() => {
        const width = range[1] - range[0];
        const numberOfTicksTarget = Math.floor(width / pixelsPerTick);

        return xScale.ticks(numberOfTicksTarget).map((value) => ({
            value,
            xOffset: xScale(value),
        }));
    }, [xScale, range, pixelsPerTick]);

    return (
        <>
            <text
                x={range[1] /2}
                y={40}
                textAnchor="middle"
                dominantBaseline="middle"
                fill='black'
                fontSize={16}
            >
                UMAP-1
            </text>
            {/* Ticks and labels */}
            {ticks.map(({ value, xOffset }) => (
                <g
                    key={value}
                    transform={`translate(${xOffset}, 0)`}
                    shapeRendering={"crispEdges"}
                >
                    <line
                        y1={TICK_LENGTH}
                        y2={-height - TICK_LENGTH}
                        stroke="#D2D7D3"
                        strokeWidth={0.5}
                    />
                    <text
                        key={value}
                        style={{
                            fontSize: "10px",
                            textAnchor: "middle",
                            transform: "translateY(20px)",
                            fill: "#D2D7D3",
                        }}
                    >
                        {value}
                    </text>
                </g>
            ))}
        </>
    );
};
