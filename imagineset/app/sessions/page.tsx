import { authOptions } from '@/lib/auth/authOptions'
import prisma from "@/lib/prisma";
import { Typography, Grid } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import Header from '@/components/header/Header';

export default async function SessionsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/api/auth/signin?callbackUrl=/")
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        }
    })
    if (user === null) return redirect("/api/auth/signin?callbackUrl=/")

    let sessions = await prisma.pipelineSession.findMany({
        where: {
            user_id: user.id
        },
        include: {
            gene_sets: {
                include: {
                    genes: true
                }
            }
        }
    })

    const SessionTable = dynamic(() => import("./SessionTable"), { ssr: false })

    return (
        <>
        <Grid item>
            <Header sessionId={params.id}/>
        </Grid>
        <Container>
            <Typography variant="h3" color="secondary.dark" className='p-5'>MY PREVIOUS SESSIONS</Typography>
            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
            </Typography>
            <SessionTable sessions={sessions} />
        </Container>
        </>
    )
}