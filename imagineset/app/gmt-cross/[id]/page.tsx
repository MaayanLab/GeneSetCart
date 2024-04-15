import { authOptions } from '@/lib/auth/authOptions'
import { GMTCrossLayout } from "./GMTCrossLayout";
import prisma from "@/lib/prisma";
import { TextField, Typography, Grid } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';

export default async function GMTCross({ params }: { params: { id: string } }) {
    // if session belongs to anonymous account go there: 
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
    
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/gmt-cross/${params.id}`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/gmt-cross/${params.id}`)

    const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
            id: params.id,
            user_id: user.id
        },
    })
    if (sessionInfo === null) return redirect('/')
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