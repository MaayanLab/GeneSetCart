import { authOptions } from '@/lib/auth/authOptions'
import { CombineLayout } from "@/app/combine/[id]/CombineLayout";
import ColorToggleButton from "@/components/misc/SectionToggle";
import prisma from "@/lib/prisma";
import { Grid, TextField, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';
import { shallowCopy } from '@/app/assemble/[id]/page';

export default async function CombinePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    // if a public session created by a public user go there: 
    const anonymousUserSession = await prisma.pipelineSession.findFirst({
        where: {
            id: params.id,
            user_id: process.env.PUBLIC_USER_ID,
            private: false
        },
        include: {
            gene_sets: {
                include: {
                    genes: true
                }
            }
        }
    })
    if (anonymousUserSession) {
        if (!session) {
            return (
                <>
                    <Grid item>
                        <Header sessionId={params.id} />
                    </Grid>
                    <Container>
                        <ColorToggleButton sessionId={params.id} />
                        <Container sx={{ mb: 5 }}>
                            <Typography variant="h3" color="secondary.dark" className='p-5'>COMBINE YOUR GENE SETS</Typography>
                            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                                Combine your gene sets using set operations (intersect, union or consensus)
                            </Typography>
                            <CombineLayout sessionInfo={anonymousUserSession} sessionId={params.id} />
                        </Container>
                    </Container>
                </>
            )
        } else {
            const user = await prisma.user.findUnique({
                where: {
                    id: session?.user.id
                },
                include: {
                    pipelineSessions: true
                }
            })
            if (user === null) return redirect(`/api/auth/signin?callbackUrl=/combine/${params.id}`)
            await shallowCopy(user, anonymousUserSession, 'combine', false)
        }
    }

    // else if created by a user account 
    // get session information
    const sessionInfo = await prisma.pipelineSession.findFirst({
        where: {
            id: params.id,
            // private: false // session must be public
        },
        include: {
            gene_sets: {
                include: {
                    genes: true
                }
            }
        }
    })
    // if public session created by another user but current user is not logged in shallow copy to public user account
    if (!session) {
        const anonymousUserId = process.env.PUBLIC_USER_ID
        const anonymousUser = await prisma.user.upsert({
            where: {
                id: anonymousUserId,
            },
            update: {},
            create: {
                id: anonymousUserId,
                name: 'Anonymous User',
            },
        })
        await shallowCopy(anonymousUser, sessionInfo, 'combine', true)
    } else { // if a public session but user is logged in then shallow copy to user's account
        const user = await prisma.user.findUnique({
            where: {
                id: session?.user.id
            },
            include: {
                pipelineSessions: true
            }
        })
        if (user === null) return redirect(`/api/auth/signin?callbackUrl=/combine/${params.id}`) // if user is not logged in redirect
        // get all users saved sessions
        const savedUserSessions = user.pipelineSessions.map((savedSession) => savedSession.id)
        // if session does not belong to currently logged in user then shallow copy session to user
        if (!savedUserSessions.includes(params.id)) {
            if (sessionInfo) { // if shared session exists
                await shallowCopy(user, sessionInfo, 'combine', false)
            } else {
                redirect('/') // redirect to home page because shared session does not exist
            }
        }
    }

    // else if current user is the owner of session
    return (
        <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <ColorToggleButton sessionId={params.id} />
                <Container sx={{ mb: 5 }}>
                    <Typography variant="h3" color="secondary.dark" className='p-5'>COMBINE YOUR GENE SETS</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Combine your gene sets using set operations (intersect, union or consensus)
                    </Typography>
                    <CombineLayout sessionInfo={sessionInfo} sessionId={params.id} />
                </Container>
            </Container>
        </>
    )
}