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
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/gmt-cross/${params.id}`)

    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        },
        include: {
            pipelineSessions: true
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/gmt-cross/${params.id}`) // if user is not logged in redirect

    const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
            id: params.id
        },
        include: {
            gene_sets: {
                include: {
                    genes: true
                }
            }
        }
    })

    const savedUserSessions = user.pipelineSessions.map((savedSession) => savedSession.id)
    // if session does not belong to user
    if (!savedUserSessions.includes(params.id)) {
        if (sessionInfo) { // if shared session exists
            const sessionSets = sessionInfo.gene_sets // get gene sets of shared session
            const newSession = await prisma.pipelineSession.create({
                data: {
                    user_id: user.id,
                },
            })
            await Promise.all(sessionSets.map(async (sessionGeneset) => await addToSessionSetsGeneObj(sessionGeneset.genes, newSession.id, sessionGeneset.name, sessionGeneset.description ? sessionGeneset.description : '')))
            redirect(`/gmt-cross/${newSession.id}`)
        } else {
            redirect('/') // redirect to home page because shared session does not exist
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