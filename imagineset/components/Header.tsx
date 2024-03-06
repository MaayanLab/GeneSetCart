'use server'
import Image from 'next/image'
import Link from 'next/link'
import { authOptions } from '../lib/auth/authOptions'
import { Session, getServerSession } from 'next-auth'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import { Logo } from './styled/Logo'
import UserComponent from './misc/LoginComponents/UserComponent'
import { headers } from 'next/headers';
import prisma from '@/lib/prisma'
import CartDrawer from './CartDrawer'
import { revalidatePath } from 'next/cache'
export async function getGenesets(sessionId: string) {
    if (sessionId) {
        const sessionGenesets = await prisma.pipelineSession.findUnique({
            where: {
                id: sessionId
            },
            select: {
                gene_sets: {
                    include: {
                        genes: true
                    }
                }
            }
        })
        return sessionGenesets ? sessionGenesets.gene_sets : []
    }
    else { return [] }
}

export async function deleteGenesetByID(genesetID: string) {
    const deleteGeneset = await prisma.geneSet.delete({
        where: {
            id: genesetID,
        },
    })
    revalidatePath('/')
    return 'deleted'
}

export default async function Header() {
    // add user authentication in header for cart drawer here
    const session = await getServerSession(authOptions)
    const headersList = headers();
    const fullUrl = headersList.get('referer') || "";
    const sessionId = fullUrl.split('/').slice(-1)[0]
    const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
            id: sessionId
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
        <Container maxWidth="lg">
            <AppBar position="static" sx={{ color: "#000" }}>
                <Toolbar>
                    <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                        <Grid item>
                            <Logo href={`/`} title="Get-Gene-Set-Go" color="secondary" />
                        </Grid>
                        <Grid item>
                            <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                <CartDrawer sessionInfo={sessionInfo} />
                                <Link href={`/gmt-cross/${sessionId}`}>
                                    <Typography variant="nav">CFDE GMT CROSSING</Typography>
                                </Link>
                                <Link href="/sessions">
                                    <Typography variant="nav">MY SESSIONS</Typography>
                                </Link>
                                <Link href="/use-cases">
                                    <Typography variant="nav">USE CASES</Typography>
                                </Link>
                                <UserComponent session={session} />
                            </Stack>
                        </Grid>
                        <Grid item xs={12}></Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </Container>
    )
}
