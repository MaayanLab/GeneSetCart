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