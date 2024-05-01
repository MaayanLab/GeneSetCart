import ColorToggleButton from "@/components/misc/SectionToggle";
import { Typography, Grid, Link } from "@mui/material";
import Container from "@mui/material/Container";
import Header from '@/components/header/Header';


export default function About({ params }: { params: { id: string } }) {
    return (
        <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>ABOUT G2SG</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                To facilitate data integration, discovery, and hypothesis generation across diverse Common Fund programs&apos; datasets, 
                highly processed data can be converted into gene-, metabolite- and drug-set libraries. Such abstracted versions of 
                the data facilitate data integration and discovery. Get-Gene-Set-Go is an interactive web-based application that 
                enables users to fetch gene sets from various Common Fund programs data sources, augment these sets with gene-gene 
                co-expression correlations or protein-protein interactions, perform set operations such as union, consensus, and 
                intersection on multiple sets, visualize and analyze these gene sets in a single session. Get-Gene-Set-Go 
                provides access to CFDE generated gene sets through a term query interface that returns gene sets related to 
                all biomedical terms sourced from most CFDE DCCs. Get-Gene-Set-Go also supports the upload of single and multiple 
                user-generated gene sets. Users of Get-Gene-Set-Go can also obtain gene sets by searching PubMed for genes co-mentioned 
                with any term in publications. Visualizations of gene sets from the various sources can be generated in the form of 
                publication-ready Venn diagrams, heatmaps, UMAP, SuperVenn diagrams, and UpSet plots that summarize the overlap and 
                similarity between sets. Users can also perform functional enrichment analysis of their assembled gene sets through 
                external links to gene set analysis tools such as Enrichr, CFDE-GSE, Rummagene, RummaGEO, Kinase Enrichment Analysis (KEA3), 
                and Chip-X Enrichment Analysis (ChEA3). All gene sets added or created in a session can be saved to a user account 
                for re-analysis and reproducibility and also shared to others. 

                G2SG also has a GMT Crossing feature where users can cross CF sourced gene set libraries to can find gene sets with a
                significant number of overlapping genes originated from different CF programs. The crossed pairs are displayed in an interactive table on the 
                <Link href='/gmt-cross' color='secondary'> CFDE GMT Crossing page </Link>. Users can also view a GPT-4-generated hypothesis proposing a possible reason for the high overlap 
                between these sets. 
                
                Overall, Get-Gene-Set-Go is a useful resource to facilitate hypothesis generation across CF datasets and programs. 
                <br></br>
                Gene set libraries are regularly updated from the sets submitted by CFDE programs on the <Link  href='https://data.cfde.cloud/' color='secondary' target="_blank"> CFDE Data Portal </Link>. 
                <br></br>
                G2SG is actively being developed by the <Link  href='https://labs.icahn.mssm.edu/maayanlab/' color='secondary' target="_blank"> Ma'ayan Lab </Link>. 
               
                </Typography>
            </Container>
        </>
    )
}