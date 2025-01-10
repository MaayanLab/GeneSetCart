import React from "react";
import {
  Box,
  Button,
  Link,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { Gene, GeneSet } from "@prisma/client";
import {
  OverlapSelection,
  alphabet,
} from "@/app/visualize/[id]/VisualizeLayout";
import { ClusteredHeatmap } from "@/components/visualize/PlotComponents/Heatmap/StaticHeatmap";
import { UpsetPlotV2 } from "@/components/visualize/PlotComponents/UpSet/Upset";
import { UMAP } from "@/components/visualize/PlotComponents/Umap/Umap";
import ReactToPrint from "react-to-print";
import { StaticSuperVenn } from "@/components/visualize/PlotComponents/SuperVenn/StaticSuperVenn";
import DownloadIcon from "@mui/icons-material/Download";
import { getNumbering } from "./fetchData";
import { CHEABarChart, EnrichrResults, KEABarChart } from "./AnalysisFigures";
import { analysisOptions, visualizationOptions } from "./ReportLayout";
import BasicTable from "./OverlapTable";
import { StaticVenn } from "@/components/visualize/PlotComponents/Venn/StaticVenn";

const marginTop = "10px";
const marginRight = "5px";
const marginBottom = "10px";
const marginLeft = "5px";

const getPageMargins = () => {
  return `@media print {
  @page {
    size: auto;
    margin: 10mm;
  }

  body {
    counter-increment: page;
  }

  /* Footer with page numbers */
  body::after {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 12px;
    color: grey;
  }

  /* Additional styles for your print content */
}`;
};

export default function Report({
  selectedSets,
  checked,
  sessionId,
  visualizationOptions,
  disabledOptions,
  analysisData,
  analysisOptions,
}: {
  selectedSets: ({
    genes: Gene[];
  } & GeneSet)[];
  checked: number[];
  sessionId: string;
  visualizationOptions: visualizationOptions;
  disabledOptions: visualizationOptions;
  analysisData: any;
  analysisOptions: analysisOptions;
}) {

  const { figureLegends, analysisLegends } = getNumbering(
    visualizationOptions,
    analysisOptions,
    disabledOptions,
    selectedSets.length
  );
  const heatmapOptions = {
    diagonal: false,
    interactive: true,
    palette: "Reds",
    fontSize: 8,
    disableLabels: false,
    annotationText: true,
  };
  const umapOptions = {
    assignGroups: false,
    minDist: 0.1,
    spread: 1,
    nNeighbors: 15,
    randomState: 42,
  };
  const upSetOptions = { color: "#000000" };
  const [overlap, setOverlap] = React.useState<OverlapSelection>({
    name: "",
    overlapGenes: [],
  });
  const legendSelectedSets = React.useMemo(() => {
    return selectedSets.map((set, i) => {
      if (selectedSets.length > 26) {
        return { ...set, alphabet: i.toString() };
      } else {
        return { ...set, alphabet: alphabet[i] };
      }
    });
  }, [selectedSets]);

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();

  const todayString = mm + "/" + dd + "/" + yyyy;
  const componentRef = React.useRef<HTMLDivElement>(null);

  console.log(analysisData)
  

  const toc = React.useMemo(() => {
    var num = 1;
    const visToc = [];
    if (visualizationOptions.heatmap && !disabledOptions.heatmap) {
      visToc.push([1, "Heatmap", "#heatmap"])
      num += 1;
    }
    if (visualizationOptions.venn && !disabledOptions.venn) {
      visToc.push([num, "Venn Diagram", "#venn"])
      num += 1;
    }
    if (visualizationOptions.supervenn && !disabledOptions.supervenn) {
      visToc.push([num, "Supervenn Diagram", "#supervenn"])
      num += 1;
    }
    if (visualizationOptions.upset && !disabledOptions.upset) {
      visToc.push([num, "Upset Plot", "#upset"])
      num += 1;
    }
    if (visualizationOptions.umap && !disabledOptions.umap) {
      visToc.push([num, "UMAP Plot", "#umap"])
      num += 1;
    }

    num = 1;
    const analysisToc = [];
    if ("overlappingGenes" in analysisData && analysisData["overlappingGenes"].length > 0) {
      analysisToc.push([num, "Overlapping Genes", "#overlappingGenes"])
      num += 1;
    }

    selectedSets.forEach((geneset, i) => {
      const setAnalysis = [];
      var j = 0;
      if (geneset.id in analysisData) {
        if ("enrichrResults" in analysisData[geneset.id] && analysisOptions.enrichr) {
          setAnalysis.push([alphabet[j], "Enrichr", `#enrichr-${geneset.id}`])
          j += 1;
        }
        if (geneset.id in analysisData && "keaResults" in analysisData[geneset.id] && analysisOptions.kea) {
          setAnalysis.push([alphabet[j], "KEA", `#kea-${geneset.id}`])
          j += 1;
        }
        if (geneset.id in analysisData && "cheaResults" in analysisData[geneset.id] && analysisOptions.chea) {
          setAnalysis.push([alphabet[j], "ChEA", `#chea-${geneset.id}`])
          j += 1;
        }
        if ("sigcomLink" in analysisData[geneset.id] && analysisOptions.sigcom) {
          setAnalysis.push([alphabet[j], "SigComLINCS", `#sigcomlincs-${geneset.id}`])
          j += 1;
        }
        if ("rummageneLink" in analysisData[geneset.id] && analysisOptions.rummagene) {
          setAnalysis.push([alphabet[j], "Rummagene", `#rummagene-${geneset.id}`])
          j += 1;
        }
        if ("rummageoLink" in analysisData[geneset.id] && analysisOptions.rummageo) {
          setAnalysis.push([alphabet[j], "RummaGEO", `#rummageo-${geneset.id}`])
          j += 1;
        }
        if ("l2s2Link" in analysisData[geneset.id] && analysisOptions.l2s2) {
          setAnalysis.push([alphabet[j], "L2S2", `#l2s2-${geneset.id}`])
          j += 1;
        }
        if ("pfocrLink" in analysisData[geneset.id] && analysisOptions.pfocr) {
          setAnalysis.push([alphabet[j], "PFOCRummage", `#pfocr-${geneset.id}`])
          j += 1;
        }
        analysisToc.push([num, geneset.name, setAnalysis]);
        num += 1;
      }
    });

    if ("playbookLink" in analysisData && analysisOptions.playbook) {
      analysisToc.push([num, "Playbook", "#playbook"])
      num += 1;
    }

    if ("gptSummary" in analysisData) {
      analysisToc.push([num, "LLM Summary", "#llm-summary"])
      num += 1;
    }

    analysisToc.push([num, "References", "#references"])

    return (
    <>
    {visToc.length > 0 && 
      <>
      <Typography variant="h5" color="secondary.dark">Visualizations</Typography>
      {visToc.map((item) => {
        return (
          <>
          <Typography variant="subtitle1" color="secondary.dark">  
            <>{item[0]}. </><Link color="secondary" href={item[2].toString() || ""}>{item[1]}</Link>
          </Typography>
          </>
        )
      })}
      <Typography variant="h5" color="secondary.dark">Analyses</Typography>
      {analysisToc.map((item) => {
        if (typeof item[2] === "string") {
          return (
            <>
            <Typography variant="subtitle1" color="secondary.dark">  
              <>{item[0]}. </><Link color="secondary" href={item[2].toString() || ""}>{item[1]}</Link>
            </Typography>
            </>
          )
        } else if (typeof item[2] === "object") {
          const subitem: string[][] = item[2];
          return (
            <>
            <Typography variant="subtitle1" color="secondary.dark">  
              <>{item[0]}. </><Link color="secondary" href={'#' + item[1].toString() || ""}>{item[1]}</Link>
              {subitem.map((subitem) => {
                return (
                  <>
                  <Typography variant="subtitle2" color="secondary.dark" marginLeft={2}>  
                    <>{subitem[0]}. </><Link color="secondary" href={subitem[2].toString() || ""}>{subitem[1]}</Link>
                  </Typography>
                  </>
                )
              })}
            </Typography>
            </>
          )}
      })}
      </>
    }
    </>
    )
  }, []);

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <Button variant="contained" color="primary" sx={{ margin: 1 }}>
            <DownloadIcon /> Download Report
          </Button>
        )}
        content={() => {
          if (!componentRef.current) {
            return null;
          }
          const tableStat = componentRef.current.cloneNode(true);
          const PrintElem = document.createElement("div");
          const header = `<div class="page-footer"></div>`;
          PrintElem.innerHTML = header;
          PrintElem.appendChild(tableStat);
          return PrintElem;
        }}
        pageStyle={`
            @page {
            size: auto;
            margin: 1in;

            @top-right-corner {
                content: counter(page);
            }
            }
        `}
      />

      <div ref={componentRef}>
        <style>{getPageMargins()}</style>
        <Paper
          sx={{
            minWidth: "100%",
          }}
        >
          <Typography
            variant="h4"
            color="secondary.dark"
            sx={{ padding: 3, paddingBottom: 0, textAlign: "center" }}
          >
            GeneSetCart Report
          </Typography>
          <Typography
            variant="subtitle1"
            color="secondary.dark"
            sx={{ padding: 1, textAlign: "center" }}
          >
            {todayString} | Session:{" "}
            <Link
              color="secondary"
              href={`https://genesetcart.cfde.cloud/analyze/${sessionId}`}
              target="_blank"
            >
              https://genesetcart.cfde.cloud/analyze/{sessionId}
            </Link>
          </Typography>
          <Typography
            variant="h5"
            color="secondary.dark"
            sx={{ borderBottom: 1, marginLeft: 3, marginTop: 2 }}
          >
            SELECTED SETS
          </Typography>
          {selectedSets.map((set, i) => {
            return (
              <Typography
                variant="subtitle1"
                color="secondary.dark"
                sx={{ padding: 1, paddingLeft: 5, textAlign: "left" }}
                key={i}
              >
                {set.name} ({set.genes.length > set.otherSymbols.length ? set.genes.length : set.otherSymbols.length} genes)
              </Typography>
            );
          })}

          <Typography variant="h5" color="secondary.dark" sx={{ borderBottom: 1, marginLeft: 3, marginTop: 2 }}>
            TABLE OF CONTENTS
          </Typography>
           
          <Typography variant="subtitle1" color="secondary.dark" sx={{ padding: 1, paddingLeft: 5, textAlign: "left" }}>
            {toc}
          </Typography> 
          <Typography
            variant="h5"
            color="secondary.dark"
            sx={{ borderBottom: 1, marginLeft: 3, marginTop: 2 }}
          >
            VISUALIZATION OF OVERLAP
          </Typography>
          {visualizationOptions.heatmap && !disabledOptions.heatmap && (
            <div
              className="flex justify-center"
              id="heatmap"
              style={{
                backgroundColor: "#FFFFFF",
                position: "relative",
                minHeight: "500px",
                minWidth: "500px",
                maxWidth: "100%",
                borderRadius: "30px",
              }}
            >
              <Stack
                direction="column"
                style={{ breakInside: "avoid" }}
                sx={{ padding: 5 }}
              >
                <ClusteredHeatmap
                  selectedSets={legendSelectedSets.map((set, i) => {
                    return { ...set, alphabet: set.name };
                  })}
                  heatmapOptions={heatmapOptions}
                />
                <Typography
                  variant="caption"
                  color="black"
                  sx={{ wordWrap: "break-word", padding: 2 }}
                >
                  <strong>Figure {figureLegends.heatmap}.</strong> Jaccard
                  similarity scores between gene sets hierarchically clustered.
                  Annotations indicate the number of genes in each overlap. An
                  interactive clustermap visualization is available from
                  GeneSetCart:{" "}
                  <Link
                    color="secondary"
                    href={`https://genesetcart.cfde.cloud/visualize/${sessionId}?checked=${checked.join(
                      ","
                    )}&type=Heatmap`}
                    target="_blank"
                  >
                    https://genesetcart.cfde.cloud/visualize/{sessionId}
                    ?checked={checked.join(",")}&type=Heatmap
                  </Link>
                </Typography>
              </Stack>
            </div>
          )}
          {visualizationOptions.venn && !disabledOptions.venn && (
            <div
              className="flex justify-center"
              id="venn"
              style={{
                backgroundColor: "#FFFFFF",
                position: "relative",
                minHeight: "500px",
                minWidth: "500px",
                maxWidth: "100%",
                borderRadius: "30px",
              }}
            >
              <Stack
                direction="column"
                justifyContent={"center"}
                style={{ breakInside: "avoid" }}
                sx={{ padding: 5 }}
              >
                <StaticVenn selectedSets={legendSelectedSets} />
                <Typography
                  variant="caption"
                  color="black"
                  sx={{ wordWrap: "break-word", padding: 2 }}
                >
                  <strong>Figure {figureLegends.venn}.</strong> Venn diagram
                  showing the overlap between the selected gene sets. An
                  interactive Venn diagram visualization is available from
                  GeneSetCart:{" "}
                  <Link
                    color="secondary"
                    href={`https://genesetcart.cfde.cloud/visualize/${sessionId}?checked=${checked.join(
                      ","
                    )}&type=Venn`}
                    target="_blank"
                  >
                    https://genesetcart.cfde.cloud/visualize/{sessionId}
                    ?checked={checked.join(",")}&type=Venn
                  </Link>
                </Typography>
              </Stack>
            </div>
          )}
          {visualizationOptions.supervenn && !disabledOptions.supervenn && (
            <div
              className="flex justify-center"
              id="supervenn"
              style={{
                backgroundColor: "#FFFFFF",
                position: "relative",
                minHeight: "500px",
                minWidth: "500px",
                maxWidth: "100%",
                borderRadius: "30px",
              }}
            >
              <Stack
                direction="column"
                style={{ breakInside: "avoid" }}
                sx={{ padding: 5 }}
              >
                <div
                  style={{ minHeight: "80%" }}
                  className="flex justify-center"
                >
                  <StaticSuperVenn
                    selectedSets={legendSelectedSets.map((set, i) => {
                      return { ...set, alphabet: set.name };
                    })}
                  />
                </div>
                <Typography
                  variant="caption"
                  color="black"
                  sx={{ wordWrap: "break-word", padding: 2 }}
                >
                  <strong>Figure {figureLegends.supervenn}.</strong> A Supervenn
                  diagram showing regions of overlapping genes between gene
                  sets. Overlapping genes counts are shown at the bottom of each
                  section An interactive Supervenn diagram visualization is
                  available from GeneSetCart:{" "}
                  <Link
                    color="secondary"
                    href={`https://genesetcart.cfde.cloud/visualize/${sessionId}?checked=${checked.join(
                      ","
                    )}&type=SuperVenn`}
                    target="_blank"
                  >
                    https://genesetcart.cfde.cloud/visualize/{sessionId}
                    ?checked={checked.join(",")}&type=SuperVenn
                  </Link>
                </Typography>
              </Stack>
            </div>
          )}
          {visualizationOptions.upset && !disabledOptions.upset && (
            <div
              className="flex justify-center"
              id="upset"
              style={{
                backgroundColor: "#FFFFFF",
                position: "relative",
                minHeight: "500px",
                minWidth: "500px",
                maxWidth: "100%",
                borderRadius: "30px",
              }}
            >
              <Stack
                direction="column"
                style={{ breakInside: "avoid" }}
                sx={{ padding: 5 }}
              >
                <div
                  style={{ minHeight: "80%" }}
                  className="flex justify-center"
                >
                  <UpsetPlotV2
                    selectedSets={legendSelectedSets}
                    setOverlap={setOverlap}
                    upSetOptions={upSetOptions}
                  />
                </div>
                <Typography
                  variant="caption"
                  color="black"
                  sx={{ wordWrap: "break-word", padding: 2 }}
                >
                  <strong>Figure {figureLegends.upset}.</strong> UpSet plot of
                  the overlap across the gene sets.{" "}
                  {legendSelectedSets.map(
                    (set) => set.alphabet + ": " + set.name + "; "
                  )}
                  . An interactive UpSet plot visualization is available from
                  GeneSetCart:{" "}
                  <Link
                    color="secondary"
                    href={`https://genesetcart.cfde.cloud/visualize/${sessionId}?checked=${checked.join(
                      ","
                    )}&type=UpSet`}
                    target="_blank"
                  >
                    https://genesetcart.cfde.cloud/visualize/{sessionId}
                    ?checked={checked.join(",")}&type=UpSet
                  </Link>
                </Typography>
              </Stack>
            </div>
          )}
          {visualizationOptions.umap && !disabledOptions.umap && (
            <div
              className="flex justify-center"
              id="umap"
              style={{
                backgroundColor: "#FFFFFF",
                position: "relative",
                minHeight: "500px",
                minWidth: "500px",
                maxWidth: "100%",
                borderRadius: "30px",
              }}
            >
              <Stack style={{ breakInside: "avoid" }} sx={{ padding: 5 }}>
                <div
                  style={{ minHeight: "80%" }}
                  className="flex justify-center"
                >
                  <UMAP
                    selectedSets={legendSelectedSets}
                    setOverlap={setOverlap}
                    umapOptions={umapOptions}
                  />
                </div>
                <Typography
                  variant="caption"
                  color="black"
                  sx={{ wordWrap: "break-word", padding: 2 }}
                >
                  <strong>Figure {figureLegends.umap}.</strong> Uniform Manifold
                  Approximation and Projection of the selected gene sets
                  clustered with Leiden clustering algorithm. The parameters
                  used for the visualization were set to: min_dist = 0.1, spread
                  = 1, and nNeighbors = 15. Visualization from:{" "}
                  <Link
                    color="secondary"
                    href={`https://genesetcart.cfde.cloud/visualize/${sessionId}?checked=${checked.join(
                      ","
                    )}&type=UMAP`}
                    target="_blank"
                  >
                    https://genesetcart.cfde.cloud/visualize/{sessionId}
                    ?checked={checked.join(",")}&type=UMAP
                  </Link>
                </Typography>
              </Stack>
            </div>
          )}
          {"overlappingGenes" in analysisData &&
          analysisData["overlappingGenes"].length > 0 ? (
            <>
              <Typography
                variant="h5"
                id="overlappingGenes"
                color="secondary.dark"
                sx={{ borderBottom: 1, marginLeft: 3, marginTop: 2 }}
              >
                OVERLAPPING GENES
              </Typography>
              <Box sx={{ padding: 3 }}>
                <BasicTable
                  rows={
                    "overlappingGenes" in analysisData
                      ? analysisData["overlappingGenes"]
                      : []
                  }
                />
                <Typography
                  variant="caption"
                  color="black"
                  sx={{ wordWrap: "break-word", padding: 2 }}
                >
                  <strong>Table 1.</strong> Gene set pairs with 25 or less
                  overlapping genes between them.
                </Typography>
              </Box>
            </>
          ) : (
            <></>
          )}
          {selectedSets[0].id in analysisData &&
          Object.keys(analysisData[selectedSets[0].id]).length > 0 ? (
            <>
              <Typography
                variant="h5"
                color="secondary.dark"
                sx={{ borderBottom: 1, marginLeft: 3, marginTop: 2 }}
              >
                ANALYSIS
              </Typography>
              <List sx={{ listStyle: "decimal", marginLeft: 5 }}>
                {selectedSets.map((geneset, i) => (
                  <ListItem sx={{ display: "list-item" }} key={i}>
                    <Typography variant="h6" color="secondary.dark" id={geneset.name}>{geneset.name} ({geneset.genes.length})</Typography>
                    <Stack direction="column">
                      {geneset.id in analysisData &&
                        "enrichrResults" in analysisData[geneset.id] &&
                        analysisOptions.enrichr && (
                          <Stack
                            direction="column"
                            sx={{ marginLeft: 5, marginTop: 1 }}
                          >
                            <Typography variant="h5" color="secondary.dark" id={`enrichr-${geneset.id}`}>
                              Enrichr Analysis
                            </Typography>
                            <EnrichrResults
                              data={analysisData[geneset.id]["enrichrResults"]}
                            />
                            <Typography
                              variant="caption"
                              color="black"
                              sx={{ wordWrap: "break-word", padding: 2 }}
                              style={{ breakInside: "avoid" }}
                            >
                              <strong>
                                Figure {figureLegends.enrichr[i]}.
                              </strong>{" "}
                              Enrichment analysis results of the {geneset.name}{" "}
                              gene set showing top 5 enriched terms from the (A)
                              WikiPathway_2023_Human and (B) GO Biological
                              Processes libraries. Open results in Enrichr [
                              {analysisLegends.enrichr}]:{" "}
                              <Link
                                color="secondary"
                                href={`https://maayanlab.cloud/Enrichr/enrich?dataset=${
                                  analysisData[geneset.id]["enrichrLink"]
                                }`}
                                target="_blank"
                              >
                                https://maayanlab.cloud/Enrichr/enrich?dataset=
                                {analysisData[geneset.id]["enrichrLink"]}
                              </Link>
                            </Typography>
                          </Stack>
                        )}
                      {geneset.id in analysisData &&
                        "keaResults" in analysisData[geneset.id] &&
                        analysisOptions.kea && (
                          <Stack
                            direction="column"
                            sx={{ marginLeft: 5, marginTop: 1 }}
                            style={{ breakInside: "avoid" }}
                          >
                            <Typography variant="h5" color="secondary.dark" id={`kea-${geneset.id}`}>
                              Kinase Enrichment Analysis
                            </Typography>
                            <KEABarChart
                              data={analysisData[geneset.id]["keaResults"]}
                            />
                            <Typography
                              variant="caption"
                              color="black"
                              sx={{ wordWrap: "break-word", padding: 2 }}
                            >
                              <strong>Figure {figureLegends.kea[i]}.</strong>{" "}
                              Kinase enrichment analysis results of the{" "}
                              {geneset.name} gene set showing top 10 ranked
                              kinases across libraries based on a mean ranking
                              from KEA3 [{analysisLegends.kea}].
                            </Typography>
                          </Stack>
                        )}
                      {geneset.id in analysisData &&
                        "cheaResults" in analysisData[geneset.id] &&
                        analysisOptions.chea && (
                          <Stack
                            direction="column"
                            sx={{ marginLeft: 5, marginTop: 1 }}
                            style={{ breakInside: "avoid" }}
                          >
                            <Typography variant="h5" color="secondary.dark" id={`chea-${geneset.id}`}>
                              Transciption Factor Enrichment Analysis
                            </Typography>
                            <CHEABarChart
                              data={analysisData[geneset.id]["cheaResults"]}
                            />
                            <Typography
                              variant="caption"
                              color="black"
                              sx={{ wordWrap: "break-word", padding: 2 }}
                            >
                              <strong>Figure {figureLegends.chea[i]}.</strong>{" "}
                              Transcription factor enrichment analysis results
                              of the {geneset.name} gene set showing top 10
                              ranked TFs across libraries based on a mean
                              ranking from ChEA3 [{analysisLegends.chea}].
                            </Typography>
                          </Stack>
                        )}
                    </Stack>
                    <List sx={{ listStyleType: "disc", marginLeft: 5 }}>
                      {geneset.id in analysisData &&
                        "sigcomLink" in analysisData[geneset.id] &&
                        analysisOptions.sigcom && (
                          <ListItem sx={{ display: "list-item" }} id={`sigcom-${geneset.id}`}>
                            View results from querying SigCom LINCS, a web-based
                            search engine that serves over 1.5 million gene
                            expression signatures processed, analyzed, and
                            visualized from LINCS, GTEx, and GEO. SigCom LINCS
                            provides ranked compounds and other perturbations
                            that maximally up- or down-regulate the collective
                            expression of the genes in the set [
                            {analysisLegends.sigcom}].
                            <br />
                            <Link
                              color="secondary"
                              href={
                                analysisData[geneset.id]
                                  ? analysisData[geneset.id]["sigcomLink"]
                                  : ""
                              }
                              target="_blank"
                            >
                              {analysisData[geneset.id]
                                ? analysisData[geneset.id]["sigcomLink"]
                                : ""}
                            </Link>
                          </ListItem>
                        )}
                      {geneset.id in analysisData &&
                        "rummageneLink" in analysisData[geneset.id] &&
                        analysisOptions.rummagene && (
                          <ListItem sx={{ display: "list-item" }} id={`rummagene-${geneset.id}`}>
                            View results from querying Rummagene, an enrichment
                            analysis tool that can be used to query hundreds of
                            thousands of gene sets extracted from supporting
                            tables of PubMed Central articles [
                            {analysisLegends.rummagene}].
                            <br />
                            <Link
                              color="secondary"
                              href={
                                analysisData[geneset.id]
                                  ? analysisData[geneset.id]["rummageneLink"]
                                  : ""
                              }
                              target="_blank"
                            >
                              {analysisData[geneset.id]
                                ? analysisData[geneset.id]["rummageneLink"]
                                : ""}
                            </Link>
                          </ListItem>
                        )}
                      {geneset.id in analysisData &&
                        "rummageoLink" in analysisData[geneset.id] &&
                        analysisOptions.rummageo && (
                          <ListItem sx={{ display: "list-item" }} id={`rummageo-${geneset.id}`}>
                            View results from querying RummaGEO, a search engine
                            for finding matching gene sets from a database that
                            contains hundreds of thousands gene sets extracted
                            automatically from NCBI&apos;s GEO repository [
                            {analysisLegends.rummageo}].
                            <br />
                            <Link
                              color="secondary"
                              href={
                                analysisData[geneset.id]
                                  ? analysisData[geneset.id]["rummageoLink"]
                                  : ""
                              }
                              target="_blank"
                            >
                              {analysisData[geneset.id]
                                ? analysisData[geneset.id]["rummageoLink"]
                                : ""}
                            </Link>
                          </ListItem>
                        )}
                        {geneset.id in analysisData &&
                        "l2s2Link" in analysisData[geneset.id] &&
                        analysisOptions.l2s2 && (
                          <ListItem sx={{ display: "list-item" }} id={`l2s2-${geneset.id}`}>
                            View results from querying L2S2, a search engine
                            for finding matching gene sets from a database that
                            contains over a million gene sets measuring response to pre-clinical compounds, drugs, and CRISPR KOs
                            [{analysisLegends.l2s2}].
                            <br />
                            <Link
                              color="secondary"
                              href={
                                analysisData[geneset.id]
                                  ? analysisData[geneset.id]["l2s2Link"]
                                  : ""
                              }
                              target="_blank"
                            >
                              {analysisData[geneset.id]
                                ? analysisData[geneset.id]["l2s2Link"]
                                : ""}
                            </Link>
                          </ListItem>
                        )}
                        {geneset.id in analysisData &&
                        "pfocrLink" in analysisData[geneset.id] &&
                        analysisOptions.pfocr && (
                          <ListItem sx={{ display: "list-item" }} id={`pfocr-${geneset.id}`}>
                            View results from querying PFOCRummage, a search engine
                            for finding matching gene sets from a database that
                            contains over 50,000 gene sets extracted from the figures of PMC articles.
                            [{analysisLegends.pfocr}].
                            <br />
                            <Link
                              color="secondary"
                              href={
                                analysisData[geneset.id]
                                  ? analysisData[geneset.id]["pfocrLink"]
                                  : ""
                              }
                              target="_blank"
                            >
                              {analysisData[geneset.id]
                                ? analysisData[geneset.id]["pfocrLink"]
                                : ""}
                            </Link>
                          </ListItem>
                        )}
                    </List>
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <></>
          )}
          {"playbookLink" in analysisData && analysisOptions.playbook && (
            <>
              <Typography
                variant="h5"
                color="secondary.dark"
                sx={{ borderBottom: 1, marginLeft: 3, marginTop: 2 }}
                id={`playbook`}
              >
                VIEW IN PLAYBOOK WORKFLOW BUILDER
              </Typography>
              <Typography sx={{ marginLeft: 5 }}>
                {" "}
                Playbook Link [{analysisLegends.playbook}]:{" "}
                <Link
                  color="secondary"
                  href={analysisData["playbookLink"]}
                  target="_blank"
                >
                  {analysisData["playbookLink"]}
                </Link>
              </Typography>
            </>
          )}
          {analysisData.gptSummary && (
            <Box sx={{ marginLeft: 3, marginTop: 2 }}>
              <Typography
                variant="h5"
                color="secondary.dark"
                sx={{ borderBottom: 1 }}
                id="llm-summary"
              >
                LLM GENERATED SUMMARY
              </Typography>
              <Typography variant="body2" color="black" sx={{ padding: 3 }}>
                {analysisData["gptSummary"]}
              </Typography>
              <Typography variant="subtitle2">
                * This summary was generated automatically by an LLM (GPT-4o).
                Interpret this summary with caution *
              </Typography>
            </Box>
          )}
          <Typography
            variant="h6"
            color="secondary.dark"
            sx={{
              borderBottom: 1,
              marginLeft: 3,
              marginTop: 2,
              marginBottom: 2,
            }}
            id={`references`}
          >
            REFERENCES
          </Typography>
          {analysisLegends.enrichr != 0 && (
            <Typography variant="body2" color="black" sx={{ marginLeft: 5 }}>
              [{analysisLegends.enrichr}] Chen EY, Tan CM, Kou Y, Duan Q, Wang
              Z, Meirelles GV, Clark NR, Ma&apos;ayan A. Enrichr: interactive
              and collaborative HTML5 gene list enrichment analysis tool. BMC
              Bioinformatics. 2013 Apr 15;14:128. doi: 10.1186/1471-2105-14-128.
            </Typography>
          )}
          {analysisLegends.kea != 0 && (
            <Typography variant="body2" color="black" sx={{ marginLeft: 5 }}>
              [{analysisLegends.kea}] Kuleshov MV, Xie Z, London ABK, Yang J,
              Evangelista JE, Lachmann A, Shu I, Torre D, Ma&apos;ayan A. KEA3:
              improved kinase enrichment analysis via data integration. Nucleic
              Acids Res. 2021 Jul 2;49(W1):W304-W316. doi: 10.1093/nar/gkab359.
            </Typography>
          )}
          {analysisLegends.chea != 0 && (
            <Typography variant="body2" color="black" sx={{ marginLeft: 5 }}>
              [{analysisLegends.chea}]. Keenan AB, Torre D, Lachmann A, Leong
              AK, Wojciechowicz ML, Utti V, Jagodnik KM, Kropiwnicki E, Wang Z,
              Ma&apos;ayan A. ChEA3: transcription factor enrichment analysis by
              orthogonal omics integration. Nucleic Acids Res. 2019 Jul
              2;47(W1):W212-W224. doi: 10.1093/nar/gkz446.
            </Typography>
          )}
          {analysisLegends.sigcom != 0 && (
            <Typography variant="body2" color="black" sx={{ marginLeft: 5 }}>
              [{analysisLegends.sigcom}] Evangelista JE, Clarke DJB, Xie Z,
              Lachmann A, Jeon M, Chen K, Jagodnik KM, Jenkins SL, Kuleshov MV,
              Wojciechowicz ML, Schürer SC, Medvedovic M, Ma&apos;ayan A. SigCom
              LINCS: data and metadata search engine for a million gene
              expression signatures. Nucleic Acids Res. 2022 Jul
              5;50(W1):W697-W709. doi: 10.1093/nar/gkac328.
            </Typography>
          )}
          {analysisLegends.rummagene != 0 && (
            <Typography variant="body2" color="black" sx={{ marginLeft: 5 }}>
              [{analysisLegends.rummagene}] Clarke DJB, Marino GB, Deng EZ, Xie
              Z, Evangelista JE, Ma&apos;ayan A. Rummagene: massive mining of
              gene sets from supporting materials of biomedical research
              publications. Commun Biol. 2024 Apr 20;7(1):482. doi:
              10.1038/s42003-024-06177-7.
            </Typography>
          )}
          {analysisLegends.rummageo != 0 && (
            <Typography variant="body2" color="black" sx={{ marginLeft: 5 }}>
              [{analysisLegends.rummageo}] Marino GB, Clarke DJB, Lachmann A, Deng EZ, Ma&apos;ayan A. 
              RummaGEO: Automatic mining of human and mouse gene sets from GEO. 
              Patterns (N Y). 2024;5(10):101072. Published 2024 Oct 11. doi:10.1016/j.patter.2024.101072
              </Typography>
          )}
          {analysisLegends.l2s2 != 0 && (
            <Typography variant="body2" color="black" sx={{ marginLeft: 5 }}>
              [{analysisLegends.l2s2}]Subramanian A, Narayan R, Corsello SM, et al. 
              A Next Generation Connectivity Map: L1000 Platform and the First 1,000,000 Profiles. 
              Cell. 2017;171(6):1437-1452.e17. doi:10.1016/j.cell.2017.10.049
            </Typography>
          )}
          {analysisLegends.pfocr != 0 && (
            <Typography variant="body2" color="black" sx={{ marginLeft: 5 }}>
              [{analysisLegends.pfocr}] Hanspers K, Riutta A, Summer-Kutmon M, Pico AR. 
              Pathway information extracted from 25 years of pathway figures. Genome Biol. 
              2020;21(1):273. Published 2020 Nov 9. doi:10.1186/s13059-020-02181-2
            </Typography>
          )}
          {analysisLegends.playbook != 0 && (
            <Typography variant="body2" color="black" sx={{ marginLeft: 5 }}>
              [{analysisLegends.playbook}] Clarke DJB, Evangelista JE, Xie Z,
              Marino GB, Maurya M, Srinivasan S, Yu K, Petrosyan V, Roth ME ,
              Milinkov M, King CH, Vora JK, Keeney J, Nemarich C, Khan W,
              Lachmann A, Ahmed N, Jenkins SL, Agris A, Pan J, Ramachandran S,
              Fahy E, Esquivel E, Mihajlovic A, Jevtic B, Milinovic V, Kim S,
              McNeely P, Wang T, Wenger E, Brown MA, Sickler A, Zhu Y, Blood PD,
              Taylor DM, Resnick AC, Mazumder R, Milosavljevic A, Subramaniam S,
              Avi Ma&apos;ayan. Playbook Workflow Builder: Interactive
              construction of bioinformatics workflows from a network of
              microservices. bioRxiv [Preprint]. 2024.
              doi:10.1101/2024.06.08.598037.
            </Typography>
          )}
          <br></br>
        </Paper>
      </div>
    </>
  );
}
