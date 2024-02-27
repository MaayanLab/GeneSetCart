'use client'

import { TableRow, TableCell, Grid, Button, Typography, Collapse, Table, Link  } from "@mui/material";
import { GeneSet, PipelineSession } from "@prisma/client";
import DeleteIcon from '@mui/icons-material/Delete';
import React from "react";
import { deleteSessionByID } from "./sessionFunctions";

export function SessionRow({session}:{session: PipelineSession & {gene_sets: GeneSet[]}}){

    const [open, setOpen] = React.useState(false)

    const deleteSession = React.useCallback((session: PipelineSession & {gene_sets: GeneSet[]})=> {
        deleteSessionByID(session.id).then((result) => console.log('deleted') )
    }
    , [session])
    return (
        <>
        <TableRow>
            <TableCell>
                <Grid container direction='column'>
                    <Grid item>
                        <Link href={`/assemble/${session.id}`} color='secondary'>{session.id}</Link>
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
                {/* <CollapsibleButton open={open} setOpen={setOpen} /> */}
            </TableCell>
            <TableCell>
                <Button color='secondary' onClick={(evt)=> deleteSession(session)}><DeleteIcon /></Button>
            </TableCell>
        </TableRow>
        {/* <TableRow>
            <TableCell colSpan={2}> */}
        <Collapse in={open} timeout="auto" unmountOnExit>
            <Table>
                <TableRow>
                    <TableCell colSpan={2}>

                    </TableCell>
                </TableRow>
            </Table>
        </Collapse>
        {/* </TableCell>
        </TableRow> */}

    </>
    )
}