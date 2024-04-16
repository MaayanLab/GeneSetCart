import Header from "@/components/header/Header"
import { Container, Typography, Grid, Box, Button } from "@mui/material"
import React from "react"
import { StyledAccordionComponent } from "./StyledAccordion"
import { UseCaseContent } from "./UseCaseContent"


export default async function UseCases({ params }: { params: { id: string } }) {
    return (
        <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>USE CASES</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, marginLeft: 3 }}>
                    This page describes some use cases of the G2SG web application.
                </Typography>
                <Container>
                <StyledAccordionComponent
                        heading="Analysis of Alexander Disease Gene Sets"
                        content={
                            <UseCaseContent description={`Alexander disease is a very rare neurodegenerative disease and is caused by a mutation in the GFAP gene 
                            that codes for the glial fibrillary acidic protein (GFAP). GFAP protein supports the brain's white matter (the myelin sheath) at normal levels but in Alexander disease, the mutation of 
                            the GFAP gene causes this protein to accumulate. Instead of helping maintain myelin, the extra GFAP does the opposite, killing other cells and damaging the myelin.
                            Here, we use the G2SG pipeline to analyze gene sets created by comparing gene expression samples obtained from GEO (Gene Expression Omnibus) of WT or control to disease samples.`}
                                launchLink="https://g2sg.cfde.cloud/analyze/clv2phuo8002nvfpmq44m8iyf" />
                        }
                    />
                    <StyledAccordionComponent
                        heading="CFDE GMT Crossing: GTEx Aging Signatures vs MoTrPAC Exercise Gene Sets"
                        content={
                            <UseCaseContent description={`By crossing the aging signatures created from GTEx with MoTrPAC Rat Endurance Exercise Training gene sets, 
                            we can investigate the possible genes that could be implicated in both aging and exercise. We find that in the crossing pairs with the
                            most significant overlapping genes are enriched for pathways are related to immune response, blood coagulation, and metabolism, 
                            which are all processes that can be affected by both aging and physical activity. The GPT-4 generated hypothesis further explains the possible ways that these 
                            overlapping genes are tied to the physiological changes that accompany both aging and exercise through these enriched pathways.`}
                                launchLink="https://g2sg.cfde.cloud/gmt-cross/clv2p3a4o002hvfpmgbsuf8p3?lib1=GTEx+Tissue-Specific+Aging+Signatures&lib2=MoTrPAC+Rat+Endurance+Exercise+Training" />
                        }
                    />
                    <StyledAccordionComponent
                        heading="CFDE GMT Crossing: Glycan G48414YA vs GTEx Aging Signatures from Blood"
                        content={
                            <UseCaseContent description={`In crossing aging signatures we created from GTEx with proteins associated with specific glycosylations,
                             we see that there are 37 genes/proteins that significantly overlap between the glycan G48414YA and GTEx aging signatures from blood 
                             (the gene sets with the most significant overlap). 
                             We find that these overlapping genes are implicated in pathways associated with blood clotting and coagulation. The GPT-4 generated hypothesis further 
                             expatiates on this potentially novel insight that this glycan G48414YA is likely involved in blood clotting that is associated with aging.`}
                                launchLink="https://g2sg.cfde.cloud/gmt-cross/clv2phuo8002nvfpmq44m8iyf?lib1=GTEx+Tissue-Specific+Aging+Signatures&lib2=Glygen+Glycosylated+Proteins" />
                        }
                    />
                </Container>
            </Container>
        </>
    )
}