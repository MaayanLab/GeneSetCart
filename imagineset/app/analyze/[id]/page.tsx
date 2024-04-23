import { authOptions } from '@/lib/auth/authOptions'
import ColorToggleButton from "@/components/misc/SectionToggle";
import prisma from "@/lib/prisma";
import { Typography, Container, Grid } from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import * as React from 'react';
import dynamic from 'next/dynamic'
import Header from '@/components/header/Header';
import { shallowCopy } from '@/app/assemble/[id]/page';


export default async function AnalyzePage({ params }: { params: { id: string } }) {
    const PaginatedTable = dynamic(() => import("./PaginationTable"), { ssr: false })

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
        const rows = anonymousUserSession ? anonymousUserSession.gene_sets : []
        return (
            <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <ColorToggleButton sessionId={params.id} />
                <Container sx={{ mb: 5 }}>
                    <Typography variant="h3" color="secondary.dark" sx={{mb: 2, mt: 2}}>ANALYZE YOUR GENE SETS</Typography>
                    <Typography variant="subtitle1" color="#666666" sx={{ mb: 3}}>
                        Analyze your gene sets by sending them to Enrichr, Enrichr-KG, Rummagene, RummaGEO, ChEA3, KEA3 and SigCOM LINCS
                    </Typography>
                    <PaginatedTable rows={rows} />
                </Container>
            </Container>
        </>
        )
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
    const session = await getServerSession(authOptions)
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
        await shallowCopy(anonymousUser, sessionInfo, 'analyze', true)
    } else { // if a public session but user is logged in then shallow copy to user's account
        const user = await prisma.user.findUnique({
            where: {
                id: session?.user.id
            },
            include: {
                pipelineSessions: true
            }
        })
        if (user === null) return redirect(`/api/auth/signin?callbackUrl=/analyze/${params.id}`) // if user is not logged in redirect
        // get all users saved sessions
        const savedUserSessions = user.pipelineSessions.map((savedSession) => savedSession.id)
        // if session does not belong to currently logged in user then shallow copy session to user
        if (!savedUserSessions.includes(params.id)) {
            if (sessionInfo) { // if shared session exists
                await shallowCopy(user, sessionInfo, 'analyze', false)
            } else {
                redirect('/') // redirect to home page because shared session does not exist
            }
        }
    }

        // get rows from sessionInfo and put in table
        const rows = sessionInfo ? sessionInfo.gene_sets : []
    // else if current user is the owner of session
    return (
        <>
        <Grid item>
            <Header sessionId={params.id} />
        </Grid>
        <Container>
            <ColorToggleButton sessionId={params.id} />
            <Container sx={{ mb: 5 }}>
                <Typography variant="h3" color="secondary.dark" sx={{mb: 2, mt: 2}}>ANALYZE YOUR GENE SETS</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3}}>
                    Analyze your gene sets by sending them to CFDE-GSE, Enrichr, Enrichr-KG, Rummagene, RummaGEO, ChEA3, KEA3 and SigCOM LINCS.
                </Typography>
                <PaginatedTable rows={rows} />
            </Container>
        </Container>
    </>
    )
}

