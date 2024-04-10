import { authOptions } from '@/lib/auth/authOptions'
import { CombineLayout } from "@/app/combine/[id]/CombineLayout";
import ColorToggleButton from "@/components/misc/SectionToggle";
import prisma from "@/lib/prisma";
import { Grid, TextField, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';
import { addToSessionSetsGeneObj } from '@/app/assemble/[id]/AssembleFunctions ';

export default async function CombinePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/combine/${params.id}`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        },
        include: {
            pipelineSessions: true
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/combine/${params.id}`) // if user is not logged in redirect

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
            <Container>
                <ColorToggleButton sessionId={params.id} />
                <Container sx={{ mb: 5 }}>
                    <Typography variant="h3" color="secondary.dark" className='p-5'>COMBINE YOUR GENE SETS</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Combine your gene sets using set operations (intersect, union or consensus)
                    </Typography>
                    <CombineLayout sessionInfo={sessionInfo} sessionId={params.id} />
                </Container>
            </Container>
        </>
    )
}