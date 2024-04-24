import ColorToggleButton from "@/components/misc/SectionToggle";
import VerticalTabs from "./AssembleOptions";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth/authOptions'
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Grid } from "@mui/material";
import Header from "@/components/header/Header";
import { addToSessionSetsGeneObj } from "./AssembleFunctions ";
import { Gene, GeneSet, PipelineSession, User } from "@prisma/client";

export async function shallowCopy(user: User,
    sessionInfo:
        (({
            gene_sets: ({
                genes: Gene[];
            } & GeneSet)[]
        } & PipelineSession | null)),
    redirectPage: string,
    anonUser: boolean
) {
    if (sessionInfo) {
        if (sessionInfo.private === false) {
            const sessionSets = sessionInfo.gene_sets // get gene sets of shared session
            const newSession = await prisma.pipelineSession.create({
                data: {
                    user_id: user.id,
                    private: !anonUser

                },
            })
            await Promise.all(sessionSets.map(async (sessionGeneset) => await addToSessionSetsGeneObj(sessionGeneset.genes, newSession.id, sessionGeneset.name, sessionGeneset.description ? sessionGeneset.description : '', user)))
            return redirect(`/${redirectPage}/${newSession.id}`)
        } else {
            return redirect('/') // redirect to homepage if session does not exist or is a private session
        }
    } else {
        return redirect('/') // redirect to homepage if session does not exist or is a private session
    }

}


export default async function AssemblePage({ params }: { params: { id: string } }) {
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
                    <Container sx={{ mb: 4 }}>
                        <ColorToggleButton sessionId={params.id} />
                        <VerticalTabs />
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
            if (user === null) return redirect(`/api/auth/signin?callbackUrl=/assemble/${params.id}`)
            await shallowCopy(user, anonymousUserSession, 'assemble', false)
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
        await shallowCopy(anonymousUser, sessionInfo, 'assemble', true)
    } else { // if a public session but user is logged in then shallow copy to user's account
        const user = await prisma.user.findUnique({
            where: {
                id: session?.user.id
            },
            include: {
                pipelineSessions: true
            }
        })
        if (user === null) return redirect(`/api/auth/signin?callbackUrl=/assemble/${params.id}`) // if user is not logged in redirect
        // get all users saved sessions
        const savedUserSessions = user.pipelineSessions.map((savedSession) => savedSession.id)
        // if session does not belong to currently logged in user then shallow copy session to user
        if (!savedUserSessions.includes(params.id)) {
            if (sessionInfo) { // if shared session exists
                await shallowCopy(user, sessionInfo, 'assemble', false)
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
            <Container sx={{ mb: 4 }}>
                <ColorToggleButton sessionId={params.id} />
                <VerticalTabs />
            </Container>
        </>
    )
}