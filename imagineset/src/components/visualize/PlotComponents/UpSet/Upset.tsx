'use client'
import * as d3 from "d3";
import React from "react"
import { UpsetInteractionData } from "./UpsetTooltip";
import { UpsetTooltip } from "./UpsetTooltip";
import { Gene, GeneSet } from "@prisma/client";

type UpsetData = {
    name: string,
    values: string[]
}[]

type SoloIntersectionType = {
    name: string,
    setName: string,
    num: number
    values: string[]
}


const formatIntersectionData = (data: UpsetData) => {
    // compiling solo set data - how many values per set
    const soloSets: SoloIntersectionType[] = [];

    // nameStr is for the setName, which makes it easy to compile
    // each name would be A, then B, so on..
    const nameStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substr(0, data.length);
    data.forEach((x, i) => {
        soloSets.push({
            name: x.name,
            setName: nameStr.substr(i, 1),
            num: x.values.length,
            values: x.values,
        });
    });

    // compiling list of intersection names recursively
    // ["A", "AB", "ABC", ...]
    const getIntNames = (start: number, end: number, nameStr: string): string[] => {
        // eg. BCD
        const name = nameStr.substring(start, end);
        // when reaching the last letter
        if (name.length === 1) {
            return [name];
        }
        const retArr = getIntNames(start + 1, end, nameStr);
        // eg. for name = BCD, would return [B] + [BC,BCD,BD] + [C,CD,D]
        return [name[0]].concat(retArr.map((x) => name[0] + x), retArr);
    };

    let intNames = getIntNames(0, nameStr.length, nameStr);

    // removing solo names
    intNames = intNames.filter((x) => x.length !== 1);

    let intersections: SoloIntersectionType[] = [];

    // compile intersections of values for each intersection name
    intNames.forEach((intName) => {
        // collecting all values: [pub1arr, pub2arr, ...]
        const values = intName.split('').map((set) => {
            const sets = soloSets.find((x) => x.setName === set)?.values
            if (sets) {
                return sets
            } else { return [] }
        }
        );

        // getting intersection
        // https://stackoverflow.com/questions/37320296/how-to-calculate-intersection-of-multiple-arrays-in-javascript-and-what-does-e
        const result = values.reduce((a, b) => a.filter((c) => b.includes(c)));
        intersections.push({
            name: intName.split('').map((set) => soloSets.find((x) => x.setName === set)?.name).join(' + '),
            setName: intName,
            num: result.length,
            values: result,
        });
    });

    // taking out all 0s
    intersections = intersections.filter((x) => x.num !== 0); // changed from .value 
    return { intersections, soloSets };
};

// include solo sets with all its data
const insertSoloDataAll = (intersections: SoloIntersectionType[], soloSets: SoloIntersectionType[]) => {
    soloSets.forEach(x => {
        intersections.push(x);
    });
    return intersections;
};

// include solo sets with only the values that ARE NOT in other sets
const insertSoloDataOutersect = (intersections: SoloIntersectionType[], soloSets: SoloIntersectionType[]) => {
    soloSets.forEach(x => {
        // compile all unique values from other sets except current set
        const otherSets = [...new Set(soloSets.map(y => y.setName === x.setName ? [] : y.values).flat())];

        // subtract otherSets values from current set values
        const values = x.values.filter(y => !otherSets.includes(y));
        intersections.push({
            name: x.name,
            setName: x.setName,
            num: values.length,
            values: values,
        })

    })
    return intersections;
}




export function UpsetPlotV2({ selectedSets }: {
    selectedSets: ({
        genes: Gene[];
    } & GeneSet)[] | undefined
}) {
    const [hoveredCell, setHoveredCell] = React.useState<UpsetInteractionData | null>(null);

    const {data, soloSets} : { data: SoloIntersectionType[]; soloSets: SoloIntersectionType[]; } = React.useMemo(() => {
        if (!selectedSets) {
            const data : SoloIntersectionType[] = []
            const soloSets : SoloIntersectionType[] = []
            return {data, soloSets};
        }

        const setData = selectedSets.map((geneset) =>  {return {name: geneset.name, values: geneset.genes.map((gene) => gene.gene_symbol)}})

        // calculating intersections WITHOUT solo sets
        const { intersections, soloSets } = formatIntersectionData(setData);

        // putting the solo sets in:
        // to include solo sets with all its data, call this function
        const data = insertSoloDataAll(intersections, soloSets);

        // to include solo sets with only the values that ARE NOT in other sets
        // ie. the outersect of values in the solo sets, call this function
        // export const allData = insertSoloDataOutersect(intersections, soloSets);
        return {data, soloSets}
    }, [selectedSets])

    const allSetNames = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substr(0, soloSets.length).split('');

    // position and dimensions
    const margin = {
        top: 20,
        right: 0,
        bottom: 300,
        left: 200,
    };
    const width = 60 * data.length;
    const height = 400;

    // The bounds (=area inside the axis) is calculated by substracting the margins
    const boundsWidth = width - margin.right - margin.left;
    const boundsHeight = height - margin.top - margin.bottom;

    // sort data decreasing
    data.sort((a, b) => b.num - a.num);

    const nums = data.map((x) => x.num);

    // set range for data by domain, and scale by range
    const xrange = d3.scaleLinear().range([0, boundsWidth]).domain([0, data.length])

    const yrange = d3
        .scaleLinear()
        .range([boundsHeight, 0])
        .domain([0, d3.max(nums) as number])

    // set axes for graph
    // const xAxis = d3.axisBottom(xrange)
    //     // .scale(xrange)
    //     .tickPadding(2)
    //     .tickFormat((d, i) => data[i].setName)
    //     .tickValues(d3.range(data.length));

    // left yaxis
    const range = yrange.range();
    const pixelsPerTick = 10 // increase spacing between ticks
    const lineheight = range[0] - range[1];
    const numberOfTicksTarget = Math.floor(lineheight / pixelsPerTick);
    const ticks = yrange.ticks(numberOfTicksTarget).map((value) => ({
        value,
        yOffset: yrange(value),
    }));
    const leftAxis =
        <>
            {/* Main vertical line */}
            <path
                d={["M", 0, range[0], "L", 0, range[1]].join(" ")}
                fill="none"
                stroke="currentColor"
            />

            {/* Ticks and labels */}
            {ticks.map(({ value, yOffset }) => (
                <g key={value} transform={`translate(0, ${yOffset})`}>
                    <line x2={-6} stroke="currentColor" />
                    <text
                        key={value}
                        style={{
                            fontSize: "10px",
                            textAnchor: "middle",
                            transform: "translateX(-20px)",
                        }}
                    >
                        {value}
                    </text>
                </g>
            ))}
        </>

    const rad = 13;
    const bottomAxisrange = xrange.range();
    const bottomAxis =
        <>
            {/* Main horizontal line */}
            <path
                d={["M", bottomAxisrange[0], range[0], "L", 9 + (data.length) * (rad * 2.7), range[0]].join(" ")}
                fill="none"
                stroke="currentColor"
            />
        </>



    const labels = soloSets.map((set, i) => {
        return (
            <text
                key={i}
                x={-30}
                y={5 + i * (rad * 2.7)}
                textAnchor="end"
                dominantBaseline="middle"
                fill='black'
                fontSize={10}
                onMouseEnter={(e) => {
                    setHoveredCell({
                        setLabel: set.name,
                        xPos: 9 + i * (rad * 2.7) + margin.left,
                        yPos: boundsHeight + yrange(set.num) + margin.top,
                        value: set.num,
                    });
                }}
                onMouseLeave={() => setHoveredCell(null)}
                cursor="pointer"
            >
                {set.name.length < 25 ? set.name : set.name.slice(0, 25) + '...'}

                {/* {set.setName} */}
            </text>
        );
    });

    // bars 
    const bars = data.map((d, i) => {
        const x = xrange(9 + i * (rad * 2.7));
        const y = yrange(yrange(d.num));

        if (d.values === null || !x || !y) {
            return;
        }

        return (
            <rect
                key={i}
                r={4}
                x={9 + i * (rad * 2.7)}
                y={yrange(d.num)}
                width={20}
                height={boundsHeight - yrange(d.num)}
                opacity={1}
                fill={'#02577b'}
                // rx={5}
                stroke={"white"}
                onMouseEnter={(e) => {
                    setHoveredCell({
                        setLabel: d.name,
                        xPos: 9 + i * (rad * 2.7) + margin.left,
                        yPos: boundsHeight + yrange(d.num) + margin.top,
                        value: d.num,
                    });
                }}
                onMouseLeave={() => setHoveredCell(null)}
                cursor="pointer"
            />
        );
    })

    // circles for image
    const circles = data.map((x, i) => {
        return allSetNames.map((y, j) => {
            let fillColor
            if (x.setName.indexOf(y) !== -1) {
                fillColor = '#02577b';
            } else {
                fillColor = 'silver';
            }

            return (
                <circle
                    r={rad}
                    cx={i * (rad * 2.7)}
                    cy={j * (rad * 2.7)}
                    opacity={1}
                    fill={fillColor}
                />
            );
        })
    })

    // add lines to circles
    const lines = data.map((x, i) => {
        return allSetNames.map((y, j) => {
            return (
                <line
                    id={`setline${i}`}
                    x1={i * (rad * 2.7)}
                    x2={i * (rad * 2.7)}
                    y1={allSetNames.indexOf(x.setName[0]) * (rad * 2.7)}
                    y2={allSetNames.indexOf(x.setName[x.setName.length - 1]) * (rad * 2.7)}
                    stroke="#02577b"
                    strokeWidth={4}
                />
            );
        })
    })


    return (
        <div style={{ position: "relative", overflow: "auto" }} >
            <svg width={width} height={height}>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[margin.left, margin.top].join(",")})`}
                >
                    <g id='upsetBars'
                        transform={`translate(0,${boundsHeight})`}
                    >
                        <g id='chart'
                            transform={'translate(1,0)'}
                        >
                            {bars}

                        </g>
                        {leftAxis}
                        {bottomAxis}

                    </g>
                    <g id='upsetCircles'
                        transform={`translate(${[20, boundsHeight + 100].join(",")})`} // change 100 to another value
                    >
                        {labels}
                        {circles}
                        {lines}
                    </g>

                </g>
            </svg>
            <UpsetTooltip interactionData={hoveredCell} width={width} height={height} />
        </div>
    );

}