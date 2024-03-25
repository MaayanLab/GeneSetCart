import Header from "@/components/header/Header"
import { Container, Typography, Grid, Box } from "@mui/material"
import React from "react"
import { StyledAccordionComponent } from "./StyledAccordion"
import Markdown from 'react-markdown'
import { readFileSync } from "fs"
import path from 'path'


const usecase1Text = `

`

export default async function UseCases({ params }: { params: { id: string } }) {
    const usecase2Text = readFileSync(
        path.resolve('app/use-cases/markdown', './glycan_vs_gtex_aging.md'), 
        {encoding:'utf8', flag:'r'}
      )

    return (
        <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>USE CASES</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, marginLeft: 3 }}>
                    This page describes some example use cases of the application.
                </Typography>
                <Container>
                    <StyledAccordionComponent
                        heading="Role of dendritic cells in cystic fibrosis"
                        content={
                            <Box sx={{ p: 1, m: 1, }}>
                                <Markdown className="prose min-w-full">{usecase1Text}</Markdown>
                            </Box>
                        }
                    />
                    <StyledAccordionComponent
                        heading="CFDE GMT Crossing: Glycan G48414YA vs GTEx Aging Signatures from Blood"
                        content={
                            <Box sx={{ p: 1, m: 1, }}>
                                <Markdown className="prose min-w-full"
                                components={{img:({node,...props})=><img style={{maxWidth:'80%'}}{...props}/>}}
                                >{usecase2Text}</Markdown>
                            </Box>
                        }
                    />
                </Container>
            </Container>
        </>
    )
}