import { authOptions } from '@/lib/auth/authOptions'
import GenesetSelect from "@/app/augment/[id]/SelectGeneset";
import ColorToggleButton from "@/components/misc/SectionToggle";
import prisma from "@/lib/prisma";
import { TextField, Typography, Grid, Chip } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';
import { shallowCopy } from '@/app/shallowcopy';
import { AugmentLayout } from './AugmentLayout';
import { SessionChip } from '@/components/misc/SesssionChip';

export default async function AugmentPage(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
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
                    <Container>
                        <ColorToggleButton sessionId={props.params.id} />
                        <Container>
                            <div className='flex items-center'>
                                <Typography variant="h3" color="secondary.dark" className='p-5'>AUGMENT YOUR GENE SETS</Typography>
                                <SessionChip sessionId={props.params.id} />
                            </div>
                            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                                Augment your gene sets with co-expressed and co-mentioned genes
                            </Typography>
                            <AugmentLayout sessionGenesets={anonymousUserSession} sessionId={props.params.id} />
                        </Container>
                    </Container>
                </>
            )
        }
        else {
            const user = await prisma.user.findUnique({
                where: {
                    id: session?.user.id
                },
                include: {
                    pipelineSessions: true
                }
            })
            if (user === null) return redirect(`/api/auth/signin?callbackUrl=/augment/${props.params.id}`)
            await shallowCopy(user, anonymousUserSession, 'augment', false, qs)
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
        await shallowCopy(anonymousUser, sessionInfo, 'augment', true, qs)
    } else { // if a public session but user is logged in then shallow copy to user's account
        const user = await prisma.user.findUnique({
            where: {
                id: session?.user.id
            },
            include: {
                pipelineSessions: true
            }
        })
        if (user === null) return redirect(`/api/auth/signin?callbackUrl=/augment/${props.params.id}`) // if user is not logged in redirect
        // get all users saved sessions
        const savedUserSessions = user.pipelineSessions.map((savedSession) => savedSession.id)
        // if session does not belong to currently logged in user then shallow copy session to user
        if (!savedUserSessions.includes(props.params.id)) {
            if (sessionInfo) { // if shared session exists
                await shallowCopy(user, sessionInfo, 'augment', false, qs)
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
            <Container>
                <ColorToggleButton sessionId={props.params.id} />
                <Container>
                    <div className='flex items-center'>
                        <Typography variant="h3" color="secondary.dark" className='p-5'>AUGMENT YOUR GENE SETS</Typography>
                        <SessionChip sessionId={props.params.id} />
                    </div>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Augment your gene sets with co-expressed and co-mentioned genes
                    </Typography>
                    <AugmentLayout sessionGenesets={sessionInfo} sessionId={props.params.id} />
                </Container>
            </Container>
        </>
    )
}