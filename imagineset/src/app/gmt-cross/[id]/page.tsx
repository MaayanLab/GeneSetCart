import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GMTCrossLayout } from "@/components/gmt-cross/GMTCrossLayout";
import prisma from "@/lib/prisma";
import { TextField, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AugmentPage({ params }: { params: { id: string } }) {
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
            {/* <ColorToggleButton sessionId={params.id} /> */}
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>COMMON FUND GENE SET CROSSING</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, marginLeft: 3 }}>
                    Cross Common Fund Generated GMTs ....(page description)
                </Typography>
                <GMTCrossLayout />
                {/* <AugmentLayout sessionGenesets={sessionInfo} sessionId={params.id}/> */}
            </Container>
        </Container>
    )
}