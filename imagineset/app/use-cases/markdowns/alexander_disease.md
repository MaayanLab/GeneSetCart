**BACKGROUND**

Alexander disease is a rare neurodegenerative disease caused by a mutation in the GFAP gene that codes for the glial fibrillary acidic protein (GFAP)[1]. GFAP protein supports the brain's white matter (the myelin sheath) at normal levels but in Alexander disease, the mutation of the GFAP gene causes this protein to accumulate. Instead of helping maintain myelin, the extra GFAP does the opposite, killing other cells and damaging the myelin. The Gene Expression Omnibus (GEO) is a major open biomedical research repository for transcriptomics and other omics datasets that currently contains millions of gene expression samples from tens of thousands of studies collected by research laboratories [2].  Here, we use the G2SG pipeline to analyze gene sets created by comparing gene expression samples obtained from GEO of WT or control to alexander disease samples.

<br />

**METHODS**

To obtain signatures, we perform differential gene expression analysis on RNA-seq gene expression samples from three GEO studies that compare control or wild type to Alexander disease samples(GSE198817, GSE197044, GSE116327). Differentially expressed genes between WT vs. disease samples for each study are computed using the limma method. This analysis was done using the Bulk RNA-seq analysis pipeline appyter [3] . 

<br />

We group these differentially expressed genes into up and down genes with up genes having a log2 fold change (logFC) > 0 and down genes having logFC < 0. The top 100 differentially expressed up and down genes based on t-statistic scores were then used to create the up and down gene sets for each study. These up and down genes from each sample were used to create a single .gmt file called the alexander_disease.gmt. The .gmt file was uploaded into the G2SG application for further integrative analysis using the “Upload GMT” option in the Assemble step of the platform.

<br />

Taking the consensus of all up gene sets (with a consensus cut-off of 6) yields seven genes that appear in at least 6 of the 10 up gene sets. We can analyze potential drugs that could reverse the gene expression changes by sending the consensus gene set to SigCom LINCS [4]. 

<br />

**RESULTS AND DISCUSSION**

Here we see some potential chemical perturbagens for example lovastatin and vicamine that would down-regulate the expression of genes upregulated in Alexander disease according to our DGE analysis. Some perturbagens are are consistent with literature, for example Lovastatin is a drug that is prescribed for the treatment of high cholesterol but has been found to correct excess hippocampal protein synthesis in the mouse model of Fragile X Syndrome, thus making it a potential drug that could treat the excess synthesis of GFAP protein in the brain. 

<br />

**REFERENCES**

- [1] J. Kuhn and M. Cascella, Alexander Disease. StatPearls Publishing, 2023.

- [2] T. Barrett et al., “NCBI GEO: archive for functional genomics data sets--update,” Nucleic Acids Res., vol. 41, no. Database issue, pp. D991–5, Jan. 2013.

- [3] D. J. B. Clarke et al., “Appyters: Turning Jupyter Notebooks into data-driven web apps,” Patterns (N Y), vol. 2, no. 3, p. 100213, Mar. 2021.

- [4]	J. E. Evangelista et al., “SigCom LINCS: data and metadata search engine for a million gene expression signatures,” Nucleic Acids Res., vol. 50, no. W1, pp. W697–W709, Jul. 2022.