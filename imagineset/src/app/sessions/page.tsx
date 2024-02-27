import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Table, TableBody, TextField, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SessionRow } from "./SessionRow";
import dynamic from "next/dynamic";

export default async function AugmentPage() {
    const session = await getServerSession(authOptions)
    if (!session) return redirect("/api/auth/signin?callbackUrl=/")
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        }
    })
    if (user === null) return redirect("/api/auth/signin?callbackUrl=/")

    const sessions = await prisma.pipelineSession.findMany({
        where: {
            user_id: user.id
        },
        include: {
            gene_sets: true
        }
    })

    const SessionTable = dynamic(() => import("./SessionTable"), { ssr: false })

    return (
        <Container>
            <Typography variant="h3" color="secondary.dark" className='p-5'>MY PREVIOUS SESSIONS</Typography>
            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
            </Typography>
            <SessionTable sessions={sessions} />
        </Container>
    )
}