'use server'
import Image from 'next/image'
import Link from 'next/link'
import { authOptions } from '@/lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import UserComponent from '../misc/LoginComponents/UserComponent'
import prisma from '@/lib/prisma'
import CartDrawer from './CartDrawer'
import { revalidatePath } from 'next/cache'
import GMTHeader, { CurrentSession } from './GMTHeader'
import dynamic from 'next/dynamic'
import { ElevatedIconButton } from '../styled/Buttons'
import { Button } from '@mui/material'
import g2sgLogo from "@/public/img/g2sg-logo-nbg.png"


const AppTitle = dynamic(() => import("./AppTitle"), {
    ssr: false, loading: () => <Button className='flex items-center space-x-3' href='/'>
        <div>
            <ElevatedIconButton
                aria-label="menu"
                sx={{ width: 35, height: 35 }}
            >
                <Image style={{ padding: 2, objectFit: "contain" }} fill={true} alt="cfde-logo" src={g2sgLogo} />
            </ElevatedIconButton>
        </div>
        <div>
            <Typography variant='cfde' color={'secondary'}>{'Get-Gene-Set-Go'}</Typography>
        </div>
    </Button>
})



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
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
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

export async function getSessionInfo(sessionId: string) {
    const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
            id: sessionId
        },
        select: {
            gene_sets: {
                include: {
                    genes: true
                }, 
                orderBy: {
                    createdAt: 'desc',
                },
            }
        }
    })
    revalidatePath('/')
    return sessionInfo
}

export default async function Header({ sessionId }: { sessionId: string }) {
    // TO DO: add user authentication in header for cart drawer here
    const session = await getServerSession(authOptions)
    if (sessionId) {
        const sessionInfo = await prisma.pipelineSession.findUnique({
            where: {
                id: sessionId
            },
            select: {
                gene_sets: {
                    include: {
                        genes: true
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }
            }
        })

        return (
            <Container maxWidth="lg">
                <AppBar position="static" sx={{ color: "#000" }}>
                    <Toolbar>
                        <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                            <Grid item>
                                {/* <Logo href={`/`} title="Get-Gene-Set-Go" color="secondary" /> */}
                                <AppTitle sessionId={sessionId} sessionInfo={sessionInfo} />
                            </Grid>
                            <Grid item>
                                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                    <a
                                        href='https://info.cfde.cloud'
                                        target={"_blank"}
                                        rel={"noreferrer"}>
                                        <Typography variant="nav"> CFDE INFORMATION PORTAL</Typography>
                                    </a>
                                    <a
                                        href='https://data.cfde.cloud'
                                        target={"_blank"}
                                        rel={"noreferrer"}>
                                        <Typography variant="nav"> CFDE DATA PORTAL</Typography>
                                    </a>
                                    <Link href="/about">
                                        <Typography variant="nav">ABOUT</Typography>
                                    </Link>
                                    <UserComponent session={session} />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Toolbar>
                    <Toolbar>
                        <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                            <Grid item>
                                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                    <CartDrawer sessionInfo={sessionInfo} />
                                    {/* <CurrentSession sessionId={sessionId} /> */}
                                    <GMTHeader sessionId={sessionId} />
                                    {session && <Link href="/sessions">
                                        <Typography variant="nav">MY SESSIONS</Typography>
                                    </Link>}
                                    <Link href="/use-cases">
                                        <Typography variant="nav">USE CASES</Typography>
                                    </Link>
                                    <Link href="/api-documentation">
                                        <Typography variant="nav"> API </Typography>
                                    </Link>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
            </Container>
        )
    } else {
        return (
            <Container maxWidth="lg">
                <AppBar position="static" sx={{ color: "#000" }}>
                    <Toolbar>
                        <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                            <Grid item>
                                {/* <Logo href={`/`} title="Get-Gene-Set-Go" color="secondary" /> */}
                                <AppTitle sessionId={sessionId} sessionInfo={null} />
                            </Grid>
                            <Grid item>
                                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                    <a
                                        href='https://info.cfde.cloud'
                                        target={"_blank"}
                                        rel={"noreferrer"}>
                                        <Typography variant="nav"> CFDE INFORMATION PORTAL</Typography>
                                    </a>
                                    <a
                                        href='https://data.cfde.cloud'
                                        target={"_blank"}
                                        rel={"noreferrer"}>
                                        <Typography variant="nav"> CFDE DATA PORTAL</Typography>
                                    </a>
                                    <Link href="/about">
                                        <Typography variant="nav">ABOUT</Typography>
                                    </Link>
                                    <UserComponent session={session} />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Toolbar>
                    <Toolbar>
                        <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                            <Grid item>
                                <Stack direction={"row"} alignItems={"center"} spacing={2}>
                                    <Link href={"/gmt-cross"}>
                                        <Typography variant="nav">CFDE GMT CROSSING</Typography>
                                    </Link>
                                    {session && <Link href="/sessions">
                                        <Typography variant="nav">MY SESSIONS</Typography>
                                    </Link>}
                                    <Link href="/use-cases">
                                        <Typography variant="nav">USE CASES</Typography>
                                    </Link>
                                    <Link href="/api-documentation">
                                        <Typography variant="nav"> API </Typography>
                                    </Link>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
            </Container>
        )
    }

}
