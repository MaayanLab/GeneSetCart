import ColorToggleButton from "@/components/misc/SectionToggle";
import VerticalTabs from "./AssembleOptions";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth/authOptions'
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Grid } from "@mui/material";
import Header from "@/components/header/Header";
import { addToSessionSets, addToSessionSetsGeneObj } from "./AssembleFunctions ";

export default async function AssemblePage({ params }: { params: { id: string } }) {
    // if gene set does not exist, shallow copy and then reopen in new link
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/assemble/${params.id}`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        },
        include: {
            pipelineSessions: true
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/assemble/${params.id}`) // if user is not logged in redirect

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

    // get all users saved sessions
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
            <Container sx={{ mb: 4 }}>
                <ColorToggleButton sessionId={params.id} />
                <VerticalTabs />
            </Container>
        </>

    )
}