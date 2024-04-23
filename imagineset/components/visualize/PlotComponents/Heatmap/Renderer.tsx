import { useMemo } from "react";
import * as d3 from "d3";
import { InteractionData } from "./Heatmap";
import { OverlapSelection } from "@/app/visualize/[id]/VisualizeLayout";

const MARGIN = { top: 10, right: 10, bottom: 30, left: 30 };


type RendererProps = {
  width: number;
  height: number;
  data: { x: string; y: string; value: number, overlap: string[] }[];
  setHoveredCell: (hoveredCell: InteractionData | null) => void;
  setOverlap: React.Dispatch<React.SetStateAction<OverlapSelection>>;
  colorScale: d3.ScaleLinear<string, string, never>;
  clusterClasses: { [key: string]: number };
};


export const Renderer = ({
  width,
  height,
  data,
  setOverlap,
  setHoveredCell,
  colorScale,
  clusterClasses
}: RendererProps) => {
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const allYGroups = useMemo(() => [...new Set(data.map((d, i) => d.y))], [data]);
  const allXGroups = useMemo(() => [...new Set(data.map((d, i) => d.x))], [data]);

  const [min = 0, max = 0] = d3.extent(data.map((d) => d.value)); // extent can return [undefined, undefined], default to [0,0] to fix types

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([0, boundsWidth])
      .domain(allXGroups)
      .padding(0.01);
  }, [data, width]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([boundsHeight, 0])
      .domain(allYGroups)
      .padding(0.01);
  }, [data, height]);


  // Build the rectangles
  const allShapes = data.map((d, i) => {
    const x = xScale(d.x);
    const y = yScale(d.y);

    if (d.value === null || !x || !y) {
      return;
    }

    if (d.x === d.y) {
      return (
        <rect
          key={i}
          r={4}
          x={xScale(d.x)}
          y={yScale(d.y)}
          width={xScale.bandwidth()}
          height={yScale.bandwidth()}
          opacity={1}
          fill={'gray'}
          // rx={5}
          stroke={"white"}
          onMouseEnter={(e) => {
            setHoveredCell({
              xLabel: "Gene Set " + d.x,
              yLabel: "Gene Set " + d.y,
              xPos: x + xScale.bandwidth() + MARGIN.left,
              yPos: y + xScale.bandwidth() / 2 + MARGIN.top,
              value: Math.round(d.value * 100) / 100,
              overlap: d.overlap
            });
          }}
          onMouseLeave={() => setHoveredCell(null)}
          cursor="pointer"
        />
      );
    }

    return (
      <rect
        key={i}
        r={4}
        x={xScale(d.x)}
        y={yScale(d.y)}
        width={xScale.bandwidth()}
        height={yScale.bandwidth()}
        opacity={1}
        fill={colorScale(d.value)}
        // rx={5}
        stroke={"white"}
        onMouseEnter={(e) => {
          setHoveredCell({
            xLabel: "Gene set " + d.x,
            yLabel: "Gene set " + d.y,
            xPos: x + xScale.bandwidth() + MARGIN.left,
            yPos: y + xScale.bandwidth() / 2 + MARGIN.top,
            value: Math.round(d.value * 100) / 100,
            overlap: d.overlap
          });
        }}
        onMouseLeave={() => setHoveredCell(null)}
        onMouseDown={() => setOverlap({ name: d.x + ',' + d.y, overlapGenes: d.overlap })}
        cursor="pointer"
      />
    );
  });

  const xLabels = allXGroups.map((name, i) => {
    const x = xScale(name);

    if (!x) {
      return null;
    }

    return (
      <text
        key={i}
        x={x + xScale.bandwidth() / 2}
        y={boundsHeight + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
      >
        {name}
      </text>
    );
  });

  const yLabels = allYGroups.map((name, i) => {
    const y = yScale(name);

    if (!y) {
      return null;
    }

    return (
      <text
        key={i}
        x={-5}
        y={y + yScale.bandwidth() / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={10}
      >
        {name}
      </text>
    );
  });


  const allSubgroups = Object.keys(clusterClasses);
  // Data Wrangling: stack the data
  const stackSeries = d3.stack().keys(allSubgroups).order(d3.stackOrderNone);
  //.offset(d3.stackOffsetNone);
  const series = stackSeries([clusterClasses]);
  // Y axis
  let barMax = 0
  Object.values(clusterClasses).forEach((item) => barMax += item)
  const yScaleBar = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, barMax])
      .range([boundsHeight, 0]);
  }, [data, height]);

  const rectangles = series.map((subgroup, i) => {
    return (
      <g key={i}>
        {subgroup.map((group, j) => {
          return (
            <rect
              key={j}
              x={1}
              y={yScaleBar(group[1])}
              height={yScaleBar(group[0]) - yScaleBar(group[1])}
              width={xScale.bandwidth()}
              opacity={0.5} 
              stroke={"white"}
            ></rect>
          );
        })}
      </g>
    );
  });

  return (
    <svg width={width} height={height} id='svg'>
      <g
        width={boundsWidth}
        height={boundsHeight}
        transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
      >
        {allShapes}
        {xLabels}
        {yLabels}

      </g>
      <g
        width={15}
        height={boundsHeight}
        transform={`translate(${[boundsWidth+ MARGIN.left, MARGIN.top].join(",")})`}>
        {rectangles}
      </g>
    </svg>
  );
};
