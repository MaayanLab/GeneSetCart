import { authOptions } from '@/lib/auth/authOptions'
import { GMTCrossLayout } from "./GMTCrossLayout";
import prisma from "@/lib/prisma";
import { Typography, Grid } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';
import { addToSessionSetsGeneObj } from '../assemble/[id]/AssembleFunctions ';

export default async function GMTCross({ params }: { params: { id: string, share: string } }) {
    // if gene set does not exist, shallow copy and then reopen in new link
    const session = await getServerSession(authOptions)
    if (session) {
        const user = await prisma.user.findUnique({
            where: {
                id: session?.user.id
            },
            include: {
                pipelineSessions: true
            }
        })
    
        if (user !== null) {
            const newSession = await prisma.pipelineSession.create({
                data: {
                    user_id: user.id,
                },
            })
    
            const newSessionId = newSession.id
            redirect(`/gmt-cross/${newSessionId}`)
        }    
    }
    
    return (
        <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <Container>
                    <Typography variant="h3" color="secondary.dark" sx={{ mb: 2, mt: 2 }}>COMMON FUND GENE SET CROSSING</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3 }}>
                        Cross Common Fund GMTs to explore their similarity for novel hypothesis generation. Each gene set pair is displayed with their Fisher exact test p-value, odds ratio and overlapping genes.
                    </Typography>
                    <GMTCrossLayout />
                </Container>
            </Container>
        </>
    )
}