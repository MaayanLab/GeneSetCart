<u> **BACKGROUND** </u>

Alexander disease (AxD) is a rare neurodegenerative disease caused by a mutation in the GFAP gene that codes for the glial fibrillary acidic protein (GFAP)[1]. GFAP protein supports the brain's white matter (the myelin sheath) at normal levels but in Alexander disease, the gain-of-function mutation of the GFAP gene causes this protein to accumulate. Instead of helping maintain myelin, the extra GFAP kills other cells and damages the myelin. The overexpression of GFAP also results in the appearance and growth of Rosenthal fibers (RFs) which are protein aggregates in the cytoplasm of astrocytes [2].

<br />

The Gene Expression Omnibus (GEO) is a major open biomedical research repository for transcriptomics and other omics datasets that currently contains millions of gene expression samples from tens of thousands of studies collected by research laboratories [3]. Here, we use the G2SG pipeline to analyze gene sets created by comparing gene expression samples obtained from GEO of wild type (WT) or controls to alexander disease samples.

<br />

 <u> **METHODS** </u>

To obtain signatures, we perform differential gene expression analysis on RNA-seq gene expression samples from three GEO studies that compare control or wild type to Alexander disease samples (GSE198817, GSE197044, GSE116327). Differentially expressed genes between WT vs. disease samples for each study are computed using the limma method. This analysis was done using the Bulk RNA-seq analysis pipeline appyter [4]. 

<br />

We group these differentially expressed genes into up and down genes with up genes having a log2 fold change (logFC) > 0 and down genes having logFC < 0. The top 100 differentially expressed up and down genes based on t-statistic scores were then used to create the up and down gene sets for each study. These up and down genes from each sample were used to create a single .gmt file called the alexander_disease.gmt. The .gmt file was uploaded into the G2SG application for further integrative analysis using the “Upload GMT” option in the Assemble step of the platform.

<br />

Taking the consensus of all up gene sets (with a consensus cut-off of 6) yields seven genes that appear in at least 6 of the 10 up gene sets. We can analyze potential drugs that could reverse the gene expression changes by sending the consensus gene set to SigCom LINCS [5]. 

<br />

<u> **RESULTS AND DISCUSSION** </u>

Here we see some potential chemical perturbagens for example lovastatin and vicamine that would down-regulate the expression of genes upregulated in Alexander disease according to our DGE analysis. Some perturbagens are are consistent with literature, for example Lovastatin which is a drug that is prescribed for the treatment of high cholesterol but has been found to correct excess hippocampal protein synthesis in the mouse model of Fragile X Syndrome [6]and is able to permeate the blood brain barrier [7]. Another study also shows that GFAP positive cells are significantly decreased in lovastatin treated groups [8], thus making it a potential drug that could treat the excess synthesis of GFAP protein in the brain. Vincamine, another chemical perturbagen in a reverser signature, has also been found to reduce GFAP expression [9] and shows ability to cross the blood brain barrier [10]. 

<br />

![Reverser and Mimicker Signatures of Consensus Up Gene Set from LINCS Chemical Pertubtions](/img/markdownImg/chemical_sig_alexander_disease.png)
<h5> Fig 1: Bar plots showing mimicker and reverser signatures to Consensus n=6 (WT vs mGFAPTg170-2 cc (GSE198817) up ∩ WT vs R236H cc (GSE198817) up ∩ WT vs mGFAPTg170-2 hip (GSE198817) up ∩ WT vs R236H hip (GSE198817) up ∩ WT vs R236H all (GSE197044) up ∩ WT vs R236H hip (GSE197044) up ∩ WT vs R236H cc (GSE197044) up ∩ Control vs AxD all (GSE116327) up ∩ Control vs AxD postmortem (GSE116327) up ∩ Control vs AxD astrocyte (GSE116327) up) gene set in SigCom LINCS. </h5>
<br />

<u> **CONCLUSION** </u>

Here, we use the G2SG Assemble-Augment-Combine-Visualize-Analyze pipeline to explore possible targets and drugs that can reverse the gene expression changes related to Alexander Disease. We show that G2SG is a powerful tool that helps analyze gene sets created from related experiments and studies such as those created from the differential gene expression analyses of gene expression samples from Alexander disease studies. This enables users to find potential biomarkers and therapeutic treatments for the disease which are not limited to only one study.

<br />

<u> **REFERENCES** </u>

- [1]	J. Kuhn and M. Cascella, Alexander Disease. StatPearls Publishing, 2023.

- [2]	A. Messing, M. W. Head, K. Galles, E. J. Galbreath, J. E. Goldman, and M. Brenner, “Fatal encephalopathy with astrocyte inclusions in GFAP transgenic mice,” Am. J. Pathol., vol. 152, no. 2, pp. 391–398, Feb. 1998.

- [3]	T. Barrett et al., “NCBI GEO: archive for functional genomics data sets--update,” Nucleic Acids Res., vol. 41, no. Database issue, pp. D991–5, Jan. 2013.

- [4]	D. J. B. Clarke et al., “Appyters: Turning Jupyter Notebooks into data-driven web apps,” Patterns (N Y), vol. 2, no. 3, p. 100213, Mar. 2021.

- [5]	J. E. Evangelista et al., “SigCom LINCS: data and metadata search engine for a million gene expression signatures,” Nucleic Acids Res., vol. 50, no. W1, pp. W697–W709, Jul. 2022.

- [6]	E. K. Osterweil et al., “Lovastatin corrects excess protein synthesis and prevents epileptogenesis in a mouse model of fragile X syndrome,” Neuron, vol. 77, no. 2, pp. 243–250, Jan. 2013.

- [7]	F. Guillot, P. Misslin, and M. Lemaire, “Comparison of fluvastatin and lovastatin blood-brain barrier transfer using in vitro and in vivo methods,” J. Cardiovasc. Pharmacol., vol. 21, no. 2, pp. 339–346, Feb. 1993.

- [8]	J. Mirzaie et al., “Neuroprotective effects of lovastatin against traumatic spinal cord injury in rats,” J. Chem. Neuroanat., vol. 125, p. 102148, Nov. 2022.

- [9]	P. Wang, C. Chen, and M. Shan, “Vincamine alleviates brain injury by attenuating neuroinflammation and oxidative damage in a mouse model of Parkinson’s disease through the NF-κB and Nrf2/HO-1 signaling pathways,” J. Biochem. Mol. Toxicol., vol. 38, no. 5, p. e23714, May 2024.

- [10]	P. Sprumont and J. Lintermans, “[Autoradiographic demonstration of the passage of vincamin through the blood-brain barrier],” Fortschr. Med., vol. 100, no. 11, pp. 471–475, Mar. 1982.