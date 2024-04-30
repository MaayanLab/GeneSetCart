import { authOptions } from '@/lib/auth/authOptions'
import ColorToggleButton from "@/components/misc/SectionToggle";
import { VisualizeLayout } from "@/app/visualize/[id]/VisualizeLayout";
import prisma from "@/lib/prisma";
import { Typography, Container, Grid } from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';
import { shallowCopy } from '@/app/shallowcopy';

export default async function VisualizePage(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
    const qs = props.searchParams
    const session = await getServerSession(authOptions)
    // if a public session created by a public user go there: 
    const anonymousUserSession = await prisma.pipelineSession.findFirst({
        where: {
            id: props.params.id,
            user_id: process.env.PUBLIC_USER_ID,
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
    if (anonymousUserSession) {
        if (!session) {
            return (
                <>
                    <Grid item>
                        <Header sessionId={props.params.id} />
                    </Grid>
                    <Container>
                        <ColorToggleButton sessionId={props.params.id} />
                        <Container sx={{ mb: 5 }}>
                            <Typography variant="h3" color="secondary.dark" className='p-5'>VISUALIZE YOUR GENE SETS</Typography>
                            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                                Visualize the overlap between your gene sets with Venn, Supervenn, UpSet, Hierarchically-Clustered Heatmaps and UMAP plots.
                            </Typography>
                            <VisualizeLayout sessionInfo={anonymousUserSession} sessionId={props.params.id} />
                        </Container>
                    </Container>
                </>
            )
        } else {
            const user = await prisma.user.findUnique({
                where: {
                    id: session?.user.id
                },
                include: {
                    pipelineSessions: true
                }
            })
            if (user === null) return redirect(`/api/auth/signin?callbackUrl=/visualize/${props.params.id}`)
            await shallowCopy(user, anonymousUserSession, 'visualize', false, qs)
        }
    }

    // else if created by a user account 
    // get session information
    const sessionInfo = await prisma.pipelineSession.findFirst({
        where: {
            id: props.params.id,
            // private: false // session must be public
        },
        include: {
            gene_sets: {
                include: {
                    genes: true
                }
            }
        }
    })
    // if public session created by another user but current user is not logged in shallow copy to public user account
    if (!session) {
        const anonymousUserId = process.env.PUBLIC_USER_ID
        const anonymousUser = await prisma.user.upsert({
            where: {
                id: anonymousUserId,
            },
            update: {},
            create: {
                id: anonymousUserId,
                name: 'Anonymous User',
            },
        })
        await shallowCopy(anonymousUser, sessionInfo, 'visualize', true, qs)
    } else { // if a public session but user is logged in then shallow copy to user's account
        const user = await prisma.user.findUnique({
            where: {
                id: session?.user.id
            },
            include: {
                pipelineSessions: true
            }
        })
        if (user === null) return redirect(`/api/auth/signin?callbackUrl=/visualize/${props.params.id}`) // if user is not logged in redirect
        // get all users saved sessions
        const savedUserSessions = user.pipelineSessions.map((savedSession) => savedSession.id)
        // if session does not belong to currently logged in user then shallow copy session to user
        if (!savedUserSessions.includes(props.params.id)) {
            if (sessionInfo) { // if shared session exists
                await shallowCopy(user, sessionInfo, 'visualize', false, qs)
            } else {
                redirect('/') // redirect to home page because shared session does not exist
            }
        }
    }

    // else if current user is the owner of session
    return (
        <>
            <Grid item>
                <Header sessionId={props.params.id} />
            </Grid>
            <Container>
                <ColorToggleButton sessionId={props.params.id} />
                <Container sx={{ mb: 5 }}>
                    <Typography variant="h3" color="secondary.dark" className='p-5'>VISUALIZE YOUR GENE SETS</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Visualize the overlap between your gene sets with Venn, Supervenn, UpSet, Hierarchically-Clustered Heatmaps and UMAP plots.
                    </Typography>
                    <VisualizeLayout sessionInfo={sessionInfo} sessionId={props.params.id} />
                </Container>
            </Container>
        </>
    )
}