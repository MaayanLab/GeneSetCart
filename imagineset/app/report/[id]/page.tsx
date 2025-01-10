import { authOptions } from '@/lib/auth/authOptions'
import ColorToggleButton from "@/components/misc/SectionToggle";
import prisma from "@/lib/prisma";
import { Grid, TextField, Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Header from '@/components/header/Header';
import { shallowCopy } from '@/app/shallowcopy';
import { ReportLayout } from './ReportLayout';
import { SessionChip } from '@/components/misc/SesssionChip';

export default async function ReportPage(props: { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }) {
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
                        <Container sx={{ mb: 5 }}>
                            <div className='flex items-center'>
                                <Typography variant="h3" color="secondary.dark" className='p-5'>GENERATE REPORT</Typography>
                                <SessionChip sessionId={props.params.id} />
                            </div>
                            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                                Generate a report of your selected gene sets which displays a downloadable .pdf containing a visualization of overlap between selected gene sets, overlapping genes,
                                Enrichr, KEA, ChEA, SigCom LINCS links and plots for selected libraries and sets, Rummagene, RummaGEO, L2S2, PCOCR, and Playbook links and a GPT generated text.
                            </Typography>
                            <ReportLayout sessionInfo={anonymousUserSession} sessionId={props.params.id} reportId={qs.reportid as string} />
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
            if (user === null) return redirect(`/api/auth/signin?callbackUrl=/report/${props.params.id}`)
            await shallowCopy(user, anonymousUserSession, 'report', false, qs)
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
        await shallowCopy(anonymousUser, sessionInfo, 'report', true, qs)
    } else { // if a public session but user is logged in then shallow copy to user's account
        const user = await prisma.user.findUnique({
            where: {
                id: session?.user.id
            },
            include: {
                pipelineSessions: true
            }
        })
        if (user === null) return redirect(`/api/auth/signin?callbackUrl=/report/${props.params.id}`) // if user is not logged in redirect
        // get all users saved sessions
        const savedUserSessions = user.pipelineSessions.map((savedSession) => savedSession.id)
        // if session does not belong to currently logged in user then shallow copy session to user
        if (!savedUserSessions.includes(props.params.id)) {
            if (sessionInfo) { // if shared session exists
                await shallowCopy(user, sessionInfo, 'combine', false, qs)
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
                <Container sx={{ mb: 5 }}>
                    <div className='flex items-center'>
                        <Typography variant="h3" color="secondary.dark" className='p-5'>GENERATE REPORT</Typography>
                        <SessionChip sessionId={props.params.id} />
                    </div>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                        Generate a report of your selected gene sets which displays a downloadable .pdf containing a visualization of overlap between selected gene sets, overlapping genes,
                        Enrichr, KEA, ChEA, SigCom LINCS links and plots for selected libraries and sets, Rummagene and RummaGEO links and a GPT generated text.
                    </Typography>
                    <ReportLayout sessionInfo={sessionInfo} sessionId={props.params.id} reportId={qs.reportid as string} />
                </Container>
            </Container>
        </>
    )
}