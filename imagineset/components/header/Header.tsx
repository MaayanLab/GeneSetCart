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
import Cookies from 'js-cookie'
import { cookies } from 'next/headers'
import { TextNav } from './client'
import { PipelineSession, User } from '@prisma/client'

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

export default async function Header({ sessionId }: { sessionId: string | undefined }) {
    const session = await getServerSession(authOptions)
    if (!sessionId) {
        sessionId = cookies().get('session_id')?.value
    }
    if (session && !sessionId) { // if logged in but has no cookie, get most recently modified session
        const sessionsRanked = await prisma.pipelineSession.findMany({
            where: {
                user_id: session.user.id
            },
            orderBy: {
                lastModified: 'desc'

            }
        })
        if (sessionsRanked.length > 0) {
            const mostRecentSessionId = sessionsRanked[0].id
            sessionId = mostRecentSessionId
        }
    }
    if (sessionId) {
        let user: User & { pipelineSessions: PipelineSession[] } | null;
        if (session) {
            user = await prisma.user.findFirst({
                where: {
                    id: session.user.id
                },
                include: {
                    pipelineSessions: true
                }
            })
        } else {
            user = await prisma.user.findFirst({
                where: {
                    id: process.env.PUBLIC_USER_ID
                },
                include: {
                    pipelineSessions: true
                }
            })
        }
        const userSessionArray = user?.pipelineSessions.map((sessionObject) => sessionObject.id)
        if (userSessionArray?.includes(sessionId)) {
            const inOneDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            Cookies.set('session_id', sessionId, { secure: true, expires: inOneDay, sameSite: 'None' })
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
                    },
                    id: true,
                    session_name: true
                }
            })

            return (
                <Container maxWidth="lg">
                    <AppBar position="static" sx={{ color: "#000" }}>
                        <Toolbar>
                            <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                                <Grid item>
                                    <AppTitle />
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
                                            <TextNav title={"ABOUT"} path={"/about"} />
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
                                        <GMTHeader sessionId={sessionId} />
                                        {session && <Link href={"/sessions"}>
                                            <TextNav title={"MY SESSIONS"} path={"/sessions"} />
                                        </Link>}
                                        <Link href={"/use-cases"}>
                                            <TextNav title={"USE CASES"} path={"/use-cases"} />
                                        </Link>
                                        <Link href={"/api-documentation"}>
                                            <TextNav title={"API"} path={"/api-documentation"} />
                                        </Link>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                </Container>
            )
        }
        else {
            Cookies.remove('session_id')
            sessionId = undefined
            return (
                <Container maxWidth="lg">
                    <AppBar position="static" sx={{ color: "#000" }}>
                        <Toolbar>
                            <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                                <Grid item>
                                    <AppTitle />
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
                                            <TextNav title={"ABOUT"} path={"/about"} />
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
                                            <TextNav title={"CFDE GMT CROSSING"} path={"/gmt-cross"} />
                                        </Link>
                                        {session && <Link href={"/sessions"}>
                                            <TextNav title={"MY SESSIONS"} path={"/sessions"} />
                                        </Link>}
                                        <Link href={"/use-cases"}>
                                            <TextNav title={"USE CASES"} path={"/use-cases"} />
                                        </Link>
                                        <Link href={"/api-documentation"}>
                                            <TextNav title={"API"} path={"/api-documentation"} />
                                        </Link>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                </Container>
            )
        }
    } else {
        return (
            <Container maxWidth="lg">
                <AppBar position="static" sx={{ color: "#000" }}>
                    <Toolbar>
                        <Grid container justifyContent={"space-between"} alignItems={"center"} spacing={2}>
                            <Grid item>
                                <AppTitle />
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
                                        <TextNav title={"ABOUT"} path={"/about"} />
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
                                        <TextNav title={"CFDE GMT CROSSING"} path={"/gmt-cross"} />
                                    </Link>
                                    {session && <Link href={"/sessions"}>
                                        <TextNav title={"MY SESSIONS"} path={"/sessions"} />
                                    </Link>}
                                    <Link href={"/use-cases"}>
                                        <TextNav title={"USE CASES"} path={"/use-cases"} />
                                    </Link>
                                    <Link href={"/api-documentation"}>
                                        <TextNav title={"API"} path={"/api-documentation"} />
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
