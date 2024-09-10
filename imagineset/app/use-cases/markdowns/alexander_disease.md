<u> **BACKGROUND** </u>

Alexander disease (AxD) is a rare neurodegenerative disease caused by a mutation in the GFAP gene that codes for the glial fibrillary acidic protein (GFAP)[1]. GFAP protein supports the brain's white matter (the myelin sheath) at normal levels but in Alexander disease, the gain-of-function mutation of the GFAP gene causes this protein to accumulate. Instead of helping maintain myelin, the extra GFAP kills other cells and damages the myelin. The overexpression of GFAP also results in the appearance and accumulation of Rosenthal fibers (RFs), protein aggregates in the cytoplasm of astrocytes [2], in subpial and white matter central nervous system areas which have typically high GFAP expression. Other than RF fiber build-up, astrocytes in Alexander disease also have abnormal cell shape and functionality. Therefore, Alexander disease is marked by this astrocyte phenotype which has physiological manifestations such as seizures. .

<br />

The Gene Expression Omnibus (GEO) is a major open biomedical research repository for transcriptomics and other omics datasets that currently contains millions of gene expression samples from tens of thousands of studies collected by research laboratories [3]. Here, we use the GeneSetCart pipeline to analyze gene sets created by comparing gene expression samples obtained from GEO of wild type (WT) or controls to alexander disease samples.

<br />

![Alexander Disease Use Case Workflow](/img/markdownImg/alexander_disease_workflow.png)
<h5> Fig 1: Alexander Disease Use Case Workflow </h5>
<br />


 <u> **METHODS** </u>

To obtain disease signatures, we perform differential gene expression analysis on RNA-seq gene expression samples from three GEO studies that compare control or wild type to Alexander disease samples (GSE198817 , GSE197044, GSE116327) [4]. The GSE198817 study contains gene expression samples from hippocampus and corpus callosum tissue of Gfap+/+, Gfap+/R236H, and mGFAPTg170-2 transgenic mice. The GSE197044 study contains RNA-seq profiles from hippocampus and corpus callosum tissue of male Gfap+/R236H and Gfap+/+ mice in FVB/N-Tac at 8 weeks of age. The GSE116327 study contains gene expression profiles of healthy control and AxD patient iPSC-derived astrocytes and post-mortem brain tissues. Differentially expressed genes between WT vs. disease samples for each study are computed using the limma method. This analysis was done using the Bulk RNA-seq analysis pipeline appyter [5]. 

<br />

We group these differentially expressed genes into up and down genes with up genes having a logFC > 0 and down genes having logFC < 0. The top 100 differentially expressed up and down genes based on t-statistic scores were then used to create the up and down gene sets for each study. These up and down genes from each sample were then used to create a single .gmt file called the alexander_disease.gmt. The .gmt file was uploaded into the GeneSetCart application for further integrative analysis using the “Upload GMT” option in the Assemble step of the platform. Using the GeneSetCart pipeline, we found consensus up and down signatures which are genes that appear in the majority of all up or down gene sets. We analyze potential drugs that could reverse the gene expression changes by sending the consensus gene sets to SigCom LINCS [6]. We also perform gene set enrichment analysis on the consensus signatures by sending them to Enrichr [1].

<br />

Taking the consensus of all up gene sets (with a consensus cut-off of 6) yields seven genes that appear in at least 6 of the 10 up gene sets. We can analyze potential drugs that could reverse the gene expression changes by sending the consensus gene set to SigCom LINCS [6]. 

<br />

<u> **RESULTS AND DISCUSSION** </u>

Choosing the consensus criteria of 3, our consensus up signature contains 65 genes while our consensus down signature contains 20 genes.  The enrichment results are presented as bar charts along with links to the reports in Enrichr. The upregulated genes (consensus up signature) are enriched for brain related terms such as complement system in neuronal development and plasticity, spinal cord injury and TYROBP causal network in microglia. The downregulated genes are also enriched for neurobiological terms such as phosphodiesterases in neuronal function and neuroinflammation and glutamatergic signaling. 

<br />

![Enrichment analysis of consensus up and down signature gene sets in Enrichr](/img/markdownImg/alexander_disease_enrichment.png)
<h5> Fig 2: Enrichment analysis of consensus up and down signature gene sets in Enrichr. (A) Top enriched terms from WikiPathway 2023 Human library of  consensus up signature gene set in Enrichr.  Consensus signature is consensus n=3 of up signatures. Plot from: https://maayanlab.cloud/Enrichr/enrich?dataset=c24d601f51ffb6f071642514d1b3a02f (B) Top enriched terms from WikiPathway 2023 Human library of consensus down signature gene set in Enrichr. Consensus signature is consensus n=3 of down signature gene sets. Plot from: https://maayanlab.cloud/Enrichr/enrich?dataset=425ca9fd10bf9f97577a8b8620681d79 
</h5>
<br />

Using the SigCOM LINCS API, we queried the consensus (n=3) up and down gene sets against all the LINCS L1000 chemical perturbation signatures to find drugs that reverse the consensus disease signature. This returns drug signatures with the z-sum and rank of each signature. Reversers (signatures that have up-regulated genes more similar to the input down genes, and the down-regulated genes more similar to the input up genes) have negative z-sums and mimickers (signatures that have similar up-regulated genes to the input up gene list, and down-regulated genes to the down gene list) have positive z-sums. Therefore, with the ranking of signatures done with the most positive z-sums being higher and most negative z-sums being lower, reversers are ranked towards the end. For each drug, we compute the Kolmogorov–Smirnov statistic using Scipy python library by (i) comparing the observed z-sum scores of its signatures to a normal distribution and (ii) comparing the observed ranks to the uniform distribution. These are used to rank the drugs based on a KS-score to find the drugs with the highest concentration of signatures at the bottom of the ranked list. There are 7 drugs that appear in both the top 10 ranked drugs from both methods: bortezomib, MG-132, vorinostat, panobinostat, GSK-1059615, BI-2536 and brefeldin-a. 

<br />

Vorinostat, a member of a class of drugs known as histone deacetylase (HDAC) inhibitors, is an FDA-approved drug for cutaneous T-cell lymphoma (CTCL). The drug has been found to decrease GFAP expression in glioblastoma cells [7]. Other studies have shown that the inhibition of histone deacetylases (HDACs) with trichostatin A or sodium butyrate reduced GFAP expression in primary human astrocytes and astrocytoma cells [8]. Another highly ranked reverser found was panobinostat, also an FDA-approved histone deacetylase (HDAC) inhibitor which is used to treat multiple myeloma in combination with bortezomib and dexamethasone [9]. With a main mechanism of action similar to vorinostat of inhibiting HDAC, panobinostat may also be a potential drug to treat Alexander disease. Another potential therapeutic agent is BI-2536. BI-2536  is a polo-like kinase 1 (PLK1) inhibitor and studies show that PLK1 inhibition induces cell autophagy and that it results in mTOR dephosphorylation [10]. Therefore, BI-2536 may potentially serve as a therapeutic agent for treating Alexander's disease because autophagic clearance of accumulated GFAP protein is regulated by the p38/MAPK and mTOR signaling pathways [11], which the drug has been found to inhibit.

<br />

<u> **CONCLUSION** </u>

Here, we use the GeneSetCart Assemble-Augment-Combine-Visualize-Analyze pipeline to explore possible targets and drugs that can reverse the gene expression changes related to Alexander Disease. We show that GeneSetCart is a powerful tool that helps analyze gene sets created from related experiments and studies such as those created from the differential gene expression analyses of gene expression samples from Alexander disease studies. This enables users to find potential biomarkers and therapeutic treatments for the disease which are not limited to only one study.

<br />

<u> **REFERENCES** </u>

- [1]	J. Kuhn and M. Cascella, Alexander Disease. StatPearls Publishing, 2023.

- [2]	A. Messing, M. W. Head, K. Galles, E. J. Galbreath, J. E. Goldman, and M. Brenner, “Fatal encephalopathy with astrocyte inclusions in GFAP transgenic mice,” Am. J. Pathol., vol. 152, no. 2, pp. 391–398, Feb. 1998.

- [3]	T. Barrett et al., “NCBI GEO: archive for functional genomics data sets--update,” Nucleic Acids Res., vol. 41, no. Database issue, pp. D991–5, Jan. 2013.

- [4]	S. C. Gammie, A. Messing, M. A. Hill, C. A. Kelm-Nelson, and T. L. Hagemann, “Large-scale gene expression changes in APP/PSEN1 and GFAP mutation models exhibit high congruence with Alzheimer’s disease,” PLoS One, vol. 19, no. 1, p. e0291995, Jan. 2024.

- [5]	D. J. B. Clarke et al., “Appyters: Turning Jupyter Notebooks into data-driven web apps,” Patterns (N Y), vol. 2, no. 3, p. 100213, Mar. 2021.

- [6]	J. E. Evangelista et al., “SigCom LINCS: data and metadata search engine for a million gene expression signatures,” Nucleic Acids Res., vol. 50, no. W1, pp. W697–W709, Jul. 2022.

- [7]	T. Perez, R. Berges, H. Maccario, D. Braguer, and S. Honoré, “P11.06 Non epigenetic effect of vorinostat in glioblastoma cells,” Neuro. Oncol., vol. 21, no. Suppl 3, p. iii43, Sep. 2019.

- [9]	R. Kanski et al., “Histone acetylation in astrocytes suppresses GFAP and stimulates a reorganization of the intermediate filament network,” J. Cell Sci., vol. 127, no. Pt 20, pp. 4368–4380, Oct. 2014.

- [9]	K. Wahaib, A. E. Beggs, H. Campbell, L. Kodali, and P. D. Ford, “Panobinostat: A histone deacetylase inhibitor for the treatment of relapsed or refractory multiple myeloma,” Am. J. Health. Syst. Pharm., vol. 73, no. 7, pp. 441–450, Apr. 2016.

- [10]	Y.-F. Tao et al., “Inhibiting PLK1 induces autophagy of acute myeloid leukemia cells via mammalian target of rapamycin pathway dephosphorylation,” Oncol. Rep., vol. 37, no. 3, pp. 1419–1429, Mar. 2017.

- [11]	G. Tang et al., “Autophagy induced by Alexander disease-mutant GFAP accumulation is regulated by p38/MAPK and mTOR signaling pathways,” Hum. Mol. Genet., vol. 17, no. 11, pp. 1540–1555, Jun. 2008.