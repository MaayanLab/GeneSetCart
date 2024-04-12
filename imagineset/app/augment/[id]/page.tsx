import { authOptions } from '@/lib/auth/authOptions'
import GenesetSelect, { AugmentLayout } from "@/app/augment/[id]/SelectGeneset";
import ColorToggleButton from "@/components/misc/SectionToggle";
import prisma from "@/lib/prisma";
import { TextField, Typography, Grid } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';
import { addToSessionSetsGeneObj } from '@/app/assemble/[id]/AssembleFunctions ';

export default async function AugmentPage({ params }: { params: { id: string } }) {
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
                <Container>
                    <Typography variant="h3" color="secondary.dark" className='p-5'>AUGMENT YOUR GENE SETS</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Augment your gene sets with co-expressed and co-mentioned genes
                    </Typography>
                    <AugmentLayout sessionGenesets={anonymousUserSession} sessionId={params.id} />
                </Container>
            </Container>
        </>
        )
    }
    // if gene set does not exist, shallow copy and then reopen in new link
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/augment/${params.id}`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        },
        include: {
            pipelineSessions: true
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/augment/${params.id}`) // if user is not logged in redirect

    const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
            id: params.id,
            private: false // only if session exists and is public
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
                <Container>
                    <Typography variant="h3" color="secondary.dark" className='p-5'>AUGMENT YOUR GENE SETS</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Augment your gene sets with co-expressed and co-mentioned genes
                    </Typography>
                    <AugmentLayout sessionGenesets={sessionInfo} sessionId={params.id} />
                </Container>
            </Container>
        </>
    )
}