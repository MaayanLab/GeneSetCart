// import { VennDiagram, venn } from "venn.js";
// // import * as venn from "venn";
// import * as d3 from "d3";
// import { useLayoutEffect } from "react";
// import { Gene } from "@prisma/client";
// import React from "react";

// type IntersectionType = {
//     sets: string[], 
//     size: number 
// }

// // Upset plot code adapted from https://github.com/chuntul/d3-upset
// const formatIntersectionData = (data: {
//     alphabet: string;
//     genes: Gene[];
//     id: string;
//     name: string;
//     description: string | null;
//     session_id: string;
//     createdAt: Date;
// }[]) => {
//     const nameStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substr(0, data.length)
//     // compiling solo set data - how many values per set
//     const soloSets: IntersectionType[] = [];

//     data.forEach((x, i) => {
//         soloSets.push({
//             sets: [x.name],
//             size: x.genes.length,
//         });
//     });

//     const getIntNames = (start: number, end: number, nameStr: string): string[] => {
//         // eg. BCD
//         const name = nameStr.substring(start, end);
//         // when reaching the last letter
//         if (name.length === 1) {
//             return [name];
//         }
//         const retArr = getIntNames(start + 1, end, nameStr);
//         // eg. for name = BCD, would return [B] + [BC,BCD,BD] + [C,CD,D]
//         return [name[0]].concat(retArr.map((x) => name[0] + x), retArr);
//     };

//     let intNames = getIntNames(0, data.length, nameStr);

//     // removing solo names
//     intNames = intNames.filter((x) => x.length !== 1);

//     let intersections: IntersectionType[] = [];

//     // compile intersections of values for each intersection name
//     intNames.forEach((intName) => {
//         // collecting all values: [pub1arr, pub2arr, ...]
//         const values = intName.split('').map((set) => {
//             const sets = soloSets.find((x) => x.sets[0] === set)?.values
//             if (sets) {
//                 return sets
//             } else { return [] }
//         }
//         );

//         // getting intersection
//         // https://stackoverflow.com/questions/37320296/how-to-calculate-intersection-of-multiple-arrays-in-javascript-and-what-does-e
//         const result = values.reduce((a, b) => a.filter((c) => b.includes(c)));
//         intersections.push({
//             sets: intName.split('').map((set) => soloSets.find((x) => x.sets === set)?.name), 
//             size: result.length
//         });
//     });

//     // taking out all 0s
//     intersections = intersections.filter((x) => x.size !== 0); // changed from .value 
//     return { intersections, soloSets };
// };

// // include solo sets with all its data
// const insertSoloDataAll = (intersections: IntersectionType[], soloSets: IntersectionType[]) => {
//     soloSets.forEach(x => {
//         intersections.push(x);
//     });
//     return intersections;
// };



// export default function Venn2({selectedSets}: {selectedSets: {
//     alphabet: string;
//     genes: Gene[];
//     id: string;
//     name: string;
//     description: string | null;
//     session_id: string;
//     createdAt: Date;
// }[]} ) {

    
//     useLayoutEffect(() => {
//     const sets = [{ sets: ['A'], size: 12 },
//     { sets: ['B'], size: 12 },
//     { sets: ['C'], size: 12 },
//     { sets: ['D'], size: 12 },
//     { sets: ['A', 'B'], size: 2 }];
    

//     const buildVenn = VennDiagram().width(450).height(450);
//     const vennChart = d3.select("#venn").datum(sets).call(buildVenn);
//     // vennChart
//     //     .selectAll("path")
//     //     .style("fill-opacity", "1")
//     //     .style("mix-blend-mode", "none")

//     // remove labels
//     // d3.select("#venn").selectAll("text").remove();

//     // let tooltip = d3.select("body").append("div").attr("class", "venntooltip");

//     // d3.selectAll(".venn-area")
//     //     .on("mouseover", function (d, i) {
//     //         // sort all the areas relative to the current item
//     //         let node = d3.select(this).transition();
//     //         node
//     //             .select("path")
//     //             .style("fill-opacity", 0.7)
//     //             .style("stroke", "red")
//     //             .style("stroke-width", "2");
//     //     })
//     //     .on("mousemove", function (event, d) {
//     //         // Display a tooltip with the current size
//     //         tooltip.transition().duration(400).style("opacity", "0.9");
//     //         tooltip.text(d.size + " users");
//     //         tooltip
//     //             .style("position", "absolute")
//     //             .style("left", event.pageX + "px")
//     //             .style("top", event.pageY - 28 + "px");
//     //     })
//     //     .on("mouseout", function (d, i) {
//     //         let node = d3.select(this).transition();
//     //         tooltip.transition().duration(400).style("opacity", "0");
//     //         d3.select(this).transition("tooltip").duration(400);
//     //         node.select("path").style("fill-opacity", 1).style("stroke-width", "0");
//     //         node
//     //             .select("text")
//     //             .style("font-weight", "100")
//     //             .style("font-size", "24px");
//     //     });
//     }, [])
//     return (
//         <svg id="svg"></svg>
//     );
// }