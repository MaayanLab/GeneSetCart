import ColorToggleButton from "@/components/misc/SectionToggle";
import VerticalTabs from "./AssembleOptions";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth/authOptions'
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Grid } from "@mui/material";
import Header from "@/components/header/Header";
import { shallowCopy } from "@/app/shallowcopy";

export default async function AssemblePage(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
    const qs = props.searchParams
    const session = await getServerSession(authOptions)
    // if a public session created by a public user go there: 
    const anonymousUserSession = await prisma.pipelineSession.findFirst({
        where: {
            id: props.params.id,
            user_id: process.env.PUBLIC_USER_ID,
            private: false
        },
        include: {
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
    if (anonymousUserSession) {
        if (!session) {
            return (
                <>
                    <Grid item>
                        <Header sessionId={props.params.id} />
                    </Grid>
                    <Container sx={{ mb: 4 }}>
                        <ColorToggleButton sessionId={props.params.id} />
                        <VerticalTabs queryParams={qs}/>
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
            if (user === null) return redirect(`/api/auth/signin?callbackUrl=/assemble/${props.params.id}`)
            await shallowCopy(user, anonymousUserSession, 'assemble', false, qs)
        }
    }

    // else if created by a user account 
    // get session information
    const sessionInfo = await prisma.pipelineSession.findFirst({
        where: {
            id: props.params.id,
            // private: false // session must be public
        },
        include: {
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
        await shallowCopy(anonymousUser, sessionInfo, 'assemble', true, qs)
    } else { // if a public session but user is logged in then shallow copy to user's account
        const user = await prisma.user.findUnique({
            where: {
                id: session?.user.id
            },
            include: {
                pipelineSessions: true
            }
        })
        if (user === null) return redirect(`/api/auth/signin?callbackUrl=/assemble/${props.params.id}`) // if user is not logged in redirect
        // get all users saved sessions
        const savedUserSessions = user.pipelineSessions.map((savedSession) => savedSession.id)
        // if session does not belong to currently logged in user then shallow copy session to user
        if (!savedUserSessions.includes(props.params.id)) {
            if (sessionInfo) { // if shared session exists
                await shallowCopy(user, sessionInfo, 'assemble', false, qs)
            } else {
                redirect('/') // redirect to home page because shared session does not exist
            }
        }
    }

    // else if current user is the owner of session
    return (
        <>
            <Grid item>
                <Header sessionId={props.params.id} />
            </Grid>
            <Container sx={{ mb: 4 }}>
                <ColorToggleButton sessionId={props.params.id} />
                <VerticalTabs queryParams={qs}/>
            </Container>
        </>
    )
}