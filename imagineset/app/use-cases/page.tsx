import Header from "@/components/header/Header"
import { Container, Typography, Grid, Box, Button } from "@mui/material"
import React from "react"
import { StyledAccordionComponent } from "./StyledAccordion"
import { UseCaseContent, UseCaseContent2 } from "./UseCaseContent"
import { readFileSync } from "fs"
import path from 'path'
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const alexanderUseCase = readFileSync(
    path.resolve('app/use-cases/markdowns', './alexander_disease.md'),
    { encoding: 'utf8', flag: 'r' }
)

const gtexAgingMotrpac = readFileSync(
    path.resolve('app/use-cases/markdowns', './gtex_aging_motrpac.md'),
    { encoding: 'utf8', flag: 'r' }
)


export default async function UseCases({ params }: { params: { id: string } }) {
    //TODO: change launch link to my private account session that cannot be deleted so that only copies are made of it. 
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
                            <UseCaseContent2 description={
                                <ReactMarkdown
                                    rehypePlugins={[rehypeRaw]}
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        img: ({ node, ...props }) => <img style={{ maxWidth: '60%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}{...props} />,
                                        h5: ({ node, ...props }) => <h5 style={{ fontSize: 11 }}{...props} />,
                                    }}>
                                    {alexanderUseCase}
                                </ReactMarkdown>}
                                launchLink="https://g2sg.cfde.cloud/analyze/clve10831005o1p8osxg25ta5" /> //  public session in my account (so that users cant change it)
                                // launchLink="https://g2sg.cfde.cloud/analyze/clv2phuo8002nvfpmq44m8iyf" />
                        }
                    />
                    <StyledAccordionComponent
                        heading="CFDE GMT Crossing: GTEx Aging Signatures vs MoTrPAC Exercise Gene Sets"
                        content={
                            <UseCaseContent2 description={
                                <ReactMarkdown
                                    rehypePlugins={[rehypeRaw]}
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        img: ({ node, ...props }) => <img style={{ maxWidth: '50%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}{...props} />,
                                        h5: ({ node, ...props }) => <h5 style={{ fontSize: 11 }}{...props} />
                                    }}>
                                    {gtexAgingMotrpac}
                                </ReactMarkdown>}
                                launchLink="https://g2sg.cfde.cloud/gmt-cross/clv2p3a4o002hvfpmgbsuf8p3?lib1=GTEx+Tissue-Specific+Aging+Signatures&lib2=MoTrPAC+Rat+Endurance+Exercise+Training" />
                        }
                    />
                </Container>
            </Container>
        </>
    )
}