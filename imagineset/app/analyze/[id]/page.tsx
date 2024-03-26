import { authOptions } from '@/lib/auth/authOptions'
import ColorToggleButton from "@/components/misc/SectionToggle";
import { VisualizeLayout } from "@/app/visualize/[id]/VisualizeLayout";
import prisma from "@/lib/prisma";
import { Typography, Container, Grid } from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import * as React from 'react';
import dynamic from 'next/dynamic'
import Header from '@/components/header/Header';


export default async function AnalyzePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/analyze/${params.id}`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/analyze/${params.id}`)

    const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
            id: params.id
        },
        select: {
            gene_sets: {
                include: {
                    genes: true
                }
            }
        }
    })

    const PaginatedTable = dynamic(() => import("./PaginationTable"), { ssr: false })
    // get rows from sessionInfo and put in table
    const rows = sessionInfo ? sessionInfo.gene_sets : []

    return (
        <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <ColorToggleButton sessionId={params.id} />
                <Container sx={{ mb: 5 }}>
                    <Typography variant="h3" color="secondary.dark" className='p-5'>ANALYZE YOUR GENE SETS</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Analyze your gene sets by sending them to Enrichr, Enrichr-KG, Rummagene, RummaGEO, ChEA3, KEA3 and SigCOM LINCS
                    </Typography>
                    <PaginatedTable rows={rows} />
                </Container>
            </Container>
        </>
    )
}
