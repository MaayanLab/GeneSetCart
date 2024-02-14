import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ColorToggleButton from "@/components/misc/SectionToggle";
import { VisualizeLayout } from "@/components/visualize/VisualizeLayout";
import prisma from "@/lib/prisma";
import {Typography, Container } from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

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
        <Container>
            <ColorToggleButton sessionId={params.id} />
            <Container sx={{mb: 5}}>
                <Typography variant="h3" color="secondary.dark" className='p-5'>VISUALIZE YOUR GENE SETS</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                Visualize the overlap between your gene sets
                </Typography>
                <VisualizeLayout sessionInfo={sessionInfo} sessionId={params.id}/>
            </Container>
        </Container>
    )
}