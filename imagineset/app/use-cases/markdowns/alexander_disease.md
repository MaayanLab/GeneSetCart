<u> **BACKGROUND** </u>

Alexander disease (AxD) is a rare neurodegenerative disease caused by a mutation in the GFAP gene which codes for the glial fibrillary acidic protein (GFAP) [1]. The GFAP protein supports the formation of myelin sheaths in normal physiology, but in Alexander disease, the gain-of-function mutation in the GFAP gene causes the protein product to accumulate. Instead of helping maintain myelin sheaths, the extra GFAP causes damage to the myelin. The overexpression of GFAP in animal models also results in the appearance and accumulation of Rosenthal fibers (RF), protein aggregates in the cytoplasm of astrocytes [2], in subpial and white matter central nervous system areas, which have typically high GFAP expression. Other than RF build-up, astrocytes in AxD also have abnormal cell shape and function. The Gene Expression Omnibus (GEO) is a major open biomedical research repository for transcriptomics and other omics datasets that currently contains millions of gene expression samples from tens of thousands of studies collected by research laboratories from around the world [3]. Here, we use the GeneSetCart pipeline to analyze gene sets created by comparing gene expression samples obtained from GEO of wild type (WT) or controls to AxD samples (Fig. 1).

<br />

![Alexander Disease Use Case Workflow](/img/markdownImg/alexander_disease_workflow.png)

<h5> Fig 1: Alexander Disease Use Case Workflow </h5>
<br />

<u> **METHOD** </u>

To obtain the AxD disease signatures, we perform differential gene expression analysis on RNA-seq gene expression samples from three GEO studies that compare control or wild type to AxD samples (GSE198817, GSE197044, GSE116327) [4]. GSE198817 contains gene expression samples from the hippocampus and corpus callosum tissue of Gfap+/+, Gfap+/R236H, and mGFAPTg170-2 transgenic mice. The GSE197044 study has RNA-seq profiles from hippocampus and corpus callosum tissue of male Gfap+/R236H and Gfap+/+ mice in FVB/N-Tac at 8 weeks of age; and the GSE116327 study has profiles from healthy controls and AxD patients iPSC-derived astrocytes and post-mortem brain tissues. Differentially expressed genes between healthy controls and disease samples for each study are computed using the limma method [5]. This analysis was performed with the bulk RNA-seq analysis pipeline appyter [6]. The up and down genes were converted into gene sets. These gene sets were uploaded to GeneSetCart for further integrative analysis. Using the GeneSetCart Combine feature, consensus up and down sets were created. Choosing the consensus criteria of 3, the consensus up signature has 65 genes and the consensus down signature has 20 genes.  These up and down consensus sets were submitted to SigCom LINCS [7] to identify potential drugs and preclinical small molecules that may reverse the disease gene expression changes in different cell lines. We also perform gene set enrichment analysis on the consensus up and down sets with Enrichr [8] (Fig 2A-C). 

<br />

![Alexander Disease Use Case Workflow](/img/markdownImg/alexander_disease_fig2.png)

<h5> Fig 2: Enriched pathways and phenotypes in Alexander’s Disease >A. Top 10 enriched terms from ChEA 2022 library of consensus up signature (n= 3) gene set in Enrichr. B. Top 10 enriched terms from WikiPathway 2023 Mouse library of consensus up signature (n= 3) gene set in Enrichr. C. Top 10 enriched terms from MGI Mammalian Phenotype Level 4 2024 library of consensus up signature gene set in Enrichr. Consensus signature is consensus n=3 of down signature gene sets. 

<u>
<a href='https://maayanlab.cloud/Enrichr/enrich?dataset=353b542bd70809d81a9dd815efacd13c' target='_blank'>View results in Enrichr</a>
</u>

</h5>
<br />

<u> **RESULT AND DISCUSSION** </u>

The consensus upregulated genes are enriched for transcription factors known to regulate immune response and inflammation. The top three transcription factors from the ChEA [9] analysis are RELA, IRF8 and STAT3 (p<0.0001, Fisher’s exact test). Consistent with inflammation and AxD, the top enriched WikiPathways [10] pathway is Spinal Cord Injury WP2432 (p=8.234e-7) with the 6 overlapping genes: CXCL10, CCND1, CCL2, CXCL1, VIM, and GFAP. The most profound results from the enrichment analysis come from the MGI Mouse Phenotypes library with the top 4 most enriched terms: Increased Susceptibility To Induced Morbidity/Mortality MP:0009763    (p=1.576e-8), CNS Inflammation MP:0006082 (p=3.795e-7), Demyelination MP:0000921 (p=0.000004793), and Abnormal Myelination MP:0000920 (p=0.00001292). The knockout mice of the overlapping genes with these terms could serve as AxD disease models due to the shared phenotype. GFAP only overlaps with genes from the Abnormal Myelination MP:0000920 phenotype together with TYROBP, PTPRC, ADGRG6, and TLR2 (Fig. 4B). When querying Rummagene [11] with the consensus up genes, the brain inflammation signature is further confirmed. Several of the top matching sets in Rummagene are from brain inflammation studies with two studies about prion disease [12,13] suggesting potentially similar mechanisms between prion disease and AxD.

The consensus down-regulated genes are enriched for terms related to brain tissues and cell types. Specifically, markers for astrocytes are the top enriched terms from the gene set libraries created from CellMarker [14], Tabula Muris [15], PanglaoDB [16], and Allen Brain Atlas 10x scRNA [17] (Fig. 4C). This observation is also supported by a RummaGEO [18]  query that returned matching gene sets from studies titled: RNA-Seq of human astrocytes GSE73721; Regionally specified human pluripotent stem cell-derived astrocytes GSE133489; and CROP-seq of hiPSC-derived astrocytes GSE182307 and GSE182309.

<br/>

<u> **REFERENCES** </u>

- [1]   Kuhn J, Cascella M. Alexander Disease. StatPearls Publishing; 2023.

- [2]   Messing A, Head MW, Galles K, Galbreath EJ, Goldman JE, Brenner M. Fatal encephalopathy with astrocyte inclusions in GFAP transgenic mice. Am J Pathol. 1998;152: 391–398.

- [3]   Barrett T, Wilhite SE, Ledoux P, Evangelista C, Kim IF, Tomashevsky M, et al. NCBI GEO: archive for functional genomics data sets--update. Nucleic Acids Res. 2013;41: D991–5.

- [4]   Gammie SC, Messing A, Hill MA, Kelm-Nelson CA, Hagemann TL. Large-scale gene expression changes in APP/PSEN1 and GFAP mutation models exhibit high congruence with Alzheimer’s disease. PLoS One. 2024;19: e0291995.

- [5]   Ritchie ME, Phipson B, Wu D, Hu Y, Law CW, Shi W, et al. limma powers differential expression analyses for RNA-sequencing and microarray studies. Nucleic Acids Res. 2015;43: e47.

- [6]   Clarke DJB, Jeon M, Stein DJ, Moiseyev N, Kropiwnicki E, Dai C, et al. Appyters: Turning Jupyter Notebooks into data-driven web apps. Patterns (N Y). 2021;2: 100213.

- [7]   Evangelista JE, Clarke DJB, Xie Z, Lachmann A, Jeon M, Chen K, et al. SigCom LINCS: data and metadata search engine for a million gene expression signatures. Nucleic Acids Res. 2022;50: W697–W709.

- [8]   Chen EY, Tan CM, Kou Y, Duan Q, Wang Z, Meirelles GV, et al. Enrichr: interactive and collaborative HTML5 gene list enrichment analysis tool. BMC Bioinformatics. 2013;14: 128.

- [9]   Keenan AB, Torre D, Lachmann A, Leong AK, Wojciechowicz ML, Utti V, et al. ChEA3: transcription factor enrichment analysis by orthogonal omics integration. Nucleic Acids Res. 2019;47: W212–W224.

- [10]  Kutmon M, Riutta A, Nunes N, Hanspers K, Willighagen EL, Bohler A, et al. WikiPathways: capturing the full diversity of pathway knowledge. Nucleic Acids Res. 2016;44: D488–94.

- [11]  Clarke DJB, Marino GB, Deng EZ, Xie Z, Evangelista JE, Ma’ayan A. Rummagene: massive mining of gene sets from supporting materials of biomedical research publications. Commun Biol. 2024;7: 482.

- [12]  Slota JA, Medina SJ, Frost KL, Booth SA. Neurons and astrocytes elicit brain region specific transcriptional responses to prion disease in the Murine CA1 and thalamus. Front Neurosci. 2022;16: 918811.

- [13]  Crespo I, Roomp K, Jurkowski W, Kitano H, del Sol A. Gene regulatory network analysis supports inflammation as a key neurodegeneration process in prion disease. BMC Syst Biol. 2012;6: 132.

- [14]  Zhang X, Lan Y, Xu J, Quan F, Zhao E, Deng C, et al. CellMarker: a manually curated resource of cell markers in human and mouse. Nucleic Acids Res. 2019;47: D721–D728.

- [15]  Tabula Muris Consortium. A single-cell transcriptomic atlas characterizes ageing tissues in the mouse. Nature. 2020;583: 590–595.

- [16]  Franzén O, Gan L-M, Björkegren JLM. PanglaoDB: a web server for exploration of mouse and human single-cell RNA sequencing data. Database (Oxford). 2019;2019. doi:10.1093/database/baz046

- [17]  Shen EH, Overly CC, Jones AR. The Allen Human Brain Atlas: comprehensive gene expression mapping of the human brain. Trends Neurosci. 2012;35: 711–714.

- [18]  Marino GB, Clarke DJB, Lachmann A, Deng EZ, Ma’ayan A. RummaGEO: Automatic mining of human and mouse gene sets from GEO. Patterns (N Y). 2024;5: 101072.



