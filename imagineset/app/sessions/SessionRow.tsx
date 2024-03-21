'use client'

import { TableRow, TableCell, Grid, Button, Typography, Link, TextField } from "@mui/material";
import { GeneSet, PipelineSession } from "@prisma/client";
import DeleteIcon from '@mui/icons-material/Delete';
import React from "react";
import { deleteSessionByID, updateSessionName } from "./sessionFunctions";
import EditIcon from '@mui/icons-material/Edit';

export function SessionRow({ session }: { session: PipelineSession & { gene_sets: GeneSet[] } }) {
    const deleteSession = React.useCallback((session: PipelineSession & { gene_sets: GeneSet[] }) => {
        deleteSessionByID(session.id).then((result) => console.log('deleted'))
    }, [session])

    return (
            <TableRow>
                <TableCell>
                    <Grid container direction='column'>
                        <Grid item>
                            <SessionNameDisplay session={session} />
                        </Grid>
                        <Grid item>
                            <Typography sx={{ fontSize: 12, color: 'gray' }}>
                                {'Added: ' + session.createdAt.toUTCString()}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: 'gray' }}>
                                {'Last Modified: ' + session.lastModified.toUTCString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </TableCell>
                <TableCell>
                </TableCell>
                <TableCell>
                    <Button color='secondary' onClick={(evt) => deleteSession(session)}><DeleteIcon /></Button>
                </TableCell>
            </TableRow>
    )
}

function SessionNameDisplay({ session }: { session: PipelineSession & { gene_sets: GeneSet[] }}) {
    const [editOpen, setEditOpen] = React.useState(false)

    const updateSession = React.useCallback((sessionId: string, newSessionName: string) => {
        updateSessionName(session.id, newSessionName).then((result) => {console.log(result); setEditOpen(false)}).catch((err) => {console.log(err); setEditOpen(false)})
    }, [session])

    if (!editOpen) {
        return (<div className="display-inline">
            <Link href={`/assemble/${session.id}`} color='secondary'>{session.session_name ? session.session_name : session.id}</Link>
            <Button color='secondary' size={'small'} onClick={() => {setEditOpen(true)}}><EditIcon fontSize="small"/></Button>
            </div>)
    }
    else {
        return (
            <TextField
                inputProps={{ 'aria-label': 'edit name' }}
                color='secondary'
                name='sessionName box'
                onKeyDown={(event) => { if (event.key === 'Enter') { updateSession(session.id, (event.target as HTMLFormElement).value);} }}
            ></TextField>
        )
    }
}