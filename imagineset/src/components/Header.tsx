'use server'
import Image from 'next/image'
import Link from 'next/link'
import { authOptions } from '../app/api/auth/[...nextauth]/route'
import { Session, getServerSession } from 'next-auth'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import { Logo } from './styled/Logo'
import UserComponent from './misc/LoginComponents/UserComponent'
import NavBreadcrumbs from './breadcrumbs'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import { Badge } from '@mui/material'
import { headers } from 'next/headers';
import prisma from '@/lib/prisma'
import CartDrawer from './CartDrawer'

export async function getGenesets(sessionId: string) {
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

export default async function Header() {
    const session = await getServerSession(authOptions)
    return (
        <Container maxWidth="lg">
            <AppBar position="static" sx={{ color: "#000" }}>
                <Toolbar>
                    <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                        <Grid item>
                            <Logo href={`/`} title="Imagineset" color="secondary" />
                        </Grid>
                        <Grid item>
                            <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                <CartDrawer />

                                <Link href="/sessions">
                                    <Typography variant="nav">MY SESSIONS</Typography>
                                </Link>
                                <Link href="/chat">
                                    <Typography variant="nav">CHATBOT</Typography>
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
