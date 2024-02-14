import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ColorToggleButton from "@/components/misc/SectionToggle";
import { VisualizeLayout } from "@/components/visualize/VisualizeLayout";
import prisma from "@/lib/prisma";
import { Typography, Container, Grid } from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Gene, GeneSet } from "@prisma/client";
import {DeleteBtn, SplitButton, ViewGenesBtn } from "@/components/analyze/ViewGenesBtn";

export default async function AnalyzePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) return redirect(`/api/auth/signin?callbackUrl=/augment/${params.id}`)
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        }
    })
    if (user === null) return redirect(`/api/auth/signin?callbackUrl=/augment/${params.id}`)

    const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
            id: params.id
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
        <Container>
            <ColorToggleButton sessionId={params.id} />
            <Container sx={{ mb: 5 }}>
                <Typography variant="h3" color="secondary.dark" className='p-5'>ANALYZE YOUR GENE SETS</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                    Analyze your gene sets by sending them to Enrichr, Enrichr-KG, ... (unfinished)
                </Typography>
                <GenesetsTable sessionInfo={sessionInfo} />
            </Container>
        </Container>
    )
}

export function GenesetsTable({ sessionInfo }: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null
}) {
    // get rows from sessionInfo and put in table
    const rows = sessionInfo ? sessionInfo.gene_sets : []
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Gene Set</TableCell>
                        <TableCell align="center">Description</TableCell>
                        <TableCell align="center">Genes</TableCell>
                        <TableCell align="center">Analysis Links</TableCell>
                        <TableCell align="center"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                <Grid container direction='column'>
                                    <Grid item>
                                        {row.name}
                                    </Grid>
                                    <Grid item>
                                        <Typography sx={{ fontSize: 12, color: 'gray' }}>
                                            {'Added: ' + row.createdAt.toUTCString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell align="right">{row.description}</TableCell>
                            <TableCell align="right"><ViewGenesBtn row={row} /></TableCell>
                            <TableCell align="right"><SplitButton row={row}/></TableCell>
                            <TableCell align="right"><DeleteBtn /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}