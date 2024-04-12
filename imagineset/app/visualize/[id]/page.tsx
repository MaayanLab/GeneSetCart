import { authOptions } from '@/lib/auth/authOptions'
import ColorToggleButton from "@/components/misc/SectionToggle";
import { VisualizeLayout } from "@/app/visualize/[id]/VisualizeLayout";
import prisma from "@/lib/prisma";
import { Typography, Container, Grid } from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';
import { addToSessionSetsGeneObj } from '@/app/assemble/[id]/AssembleFunctions ';

export default async function VisualizePage({ params }: { params: { id: string } }) {
    const anonymousUserSession = await prisma.pipelineSession.findFirst({
        where: {
            id: params.id,
            user_id: process.env.PUBLIC_USER_ID
        }, 
        include: {
            gene_sets: {
                include: {
                    genes: true
                }
            }
        }
    })
    if (anonymousUserSession) {
        return (
            <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <ColorToggleButton sessionId={params.id} />
                <Container sx={{ mb: 5 }}>
                    <Typography variant="h3" color="secondary.dark" className='p-5'>VISUALIZE YOUR GENE SETS</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Visualize the overlap between your gene sets with Venn, Supervenn, UpSet, Hierarchically-Clustered Heatmaps and UMAP plots.
                    </Typography>
                    <VisualizeLayout sessionInfo={anonymousUserSession} sessionId={params.id} />
                </Container>
            </Container>
        </>
        )
    }
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/visualize/${params.id}`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        },
        include: {
            pipelineSessions: true
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/visualize/${params.id}`) // if user is not logged in redirect

    const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
            id: params.id,
            private: false
        },
        include: {
            gene_sets: {
                include: {
                    genes: true
                }
            }
        }
    })

    // get all users saved sessions
    const savedUserSessions = user.pipelineSessions.map((savedSession) => savedSession.id)
    // if session does not belong to user
    if (!savedUserSessions.includes(params.id)) {
        if (sessionInfo) { // if shared session exists
            const sessionSets = sessionInfo.gene_sets // get gene sets of shared session
            const newSession = await prisma.pipelineSession.create({
                data: {
                    user_id: user.id,
                    private: true
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
                <ColorToggleButton sessionId={params.id} />
                <Container sx={{ mb: 5 }}>
                    <Typography variant="h3" color="secondary.dark" className='p-5'>VISUALIZE YOUR GENE SETS</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Visualize the overlap between your gene sets with Venn, Supervenn, UpSet, Hierarchically-Clustered Heatmaps and UMAP plots.
                    </Typography>
                    <VisualizeLayout sessionInfo={sessionInfo} sessionId={params.id} />
                </Container>
            </Container>
        </>
    )
}