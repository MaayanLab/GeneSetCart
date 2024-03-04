import { authOptions } from '@/lib/auth/authOptions'
import { GMTCrossLayout } from "./GMTCrossLayout";
import prisma from "@/lib/prisma";
import { TextField, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AugmentPage() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/gmt-cross/`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/gmt-cross/`)

    return (
        <Container>
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>COMMON FUND GENE SET CROSSING</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, marginLeft: 3 }}>
                    Cross Common Fund GMTs to explore their similarity for novel hypothesis generation. Each gene set pair is displayed with their Fisher exact test p-value, odds ratio and overlapping genes. 
                </Typography>
                <GMTCrossLayout />
            </Container>
        </Container>
    )
}