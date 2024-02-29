import ColorToggleButton from "@/components/misc/SectionToggle";
import VerticalTabs from "./AssembleOptions";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth/authOptions'
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AssemblePage({ params }: { params: { id: string } }){
    // add user authentication before displaying
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/assemble/${params.id}`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/assemble/${params.id}`)

    return (
        <Container sx={{mb:4}}>
        <ColorToggleButton sessionId={params.id}/>
        <VerticalTabs />
        </Container>
    )
}