import prisma from "@/lib/prisma";
import { Chip, Tooltip } from "@mui/material";

export async function SessionChip({ sessionId }: { sessionId: string }) {
    const session = await prisma.pipelineSession.findUnique({
        where: {
            id: sessionId
        }
    })
    if (session === null) return <></>
    return (
        <Tooltip title={`Current session is ${session.private ? 'private' : 'public'}`}>
            <Chip label={session.private ? 'Private' : 'Public'} variant="outlined" />
        </Tooltip>
    )
}