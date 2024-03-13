import { authOptions } from '@/lib/auth/authOptions'
import { CombineLayout } from "@/app/combine/[id]/CombineLayout";
import ColorToggleButton from "@/components/misc/SectionToggle";
import prisma from "@/lib/prisma";
import { Grid, TextField, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';

export default async function AugmentPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/augment/${params.id}`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/augment/${params.id}`)

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