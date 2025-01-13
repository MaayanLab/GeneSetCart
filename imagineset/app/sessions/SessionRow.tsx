'use client'

import { TableRow, TableCell, Grid, Button, Typography, Link, TextField, ClickAwayListener, Tooltip, Chip } from "@mui/material";
import { Gene, GeneSet, PipelineSession } from "@prisma/client";
import DeleteIcon from '@mui/icons-material/Delete';
import React from "react";
import { deleteSessionByID, updatePrivacyAccess, updateSessionName } from "./sessionFunctions";
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import { copyToClipboard } from "@/components/assemble/fileUpload/DataTable";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadURI } from "../visualize/[id]/VisualizeLayout";

type GeneSetGenes = {
    id: string;
    name: string;
    description: string | null;
    session_id: string;
    createdAt: Date;
    isHumanGenes: boolean;
    otherSymbols: string[];
    genes: Gene[];
    background: string | null;
}

export function SessionRow({ session }: { session: PipelineSession & { gene_sets: GeneSetGenes[] }}) {


    const deleteSession = React.useCallback((session: PipelineSession & { gene_sets: GeneSet[] }) => {
        deleteSessionByID(session.id).then((result) => console.log('deleted'))
    }, [])

    const [open, setOpen] = React.useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(true);
    };


    const downloadSessionSets = () => {
        let gmtContent = "data:text/gmt;charset=utf-8," 
        + session.gene_sets.map((gene_set, index) => {
            const genes = gene_set?.isHumanGenes ? gene_set?.genes.map((gene) => gene.gene_symbol) : gene_set?.otherSymbols
            const GMTInfo = (index === 0) ? gene_set?.name + '\t' + genes?.join('\t') : '\n' + gene_set?.name + '\t' + genes?.join('\t')
            return GMTInfo
        })
        downloadURI(gmtContent, session.session_name ? session.session_name : 'Unnamed_GMT' + '.gmt')
    }

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
                        <Typography sx={{ fontSize: 12, color: 'gray' }}>
                            {'No. Gene Sets: ' + session.gene_sets.length}
                        </Typography>
                    </Grid>
                </Grid>
            </TableCell>
            <TableCell>
                <Chip label={session.private ? 'Private' : 'Public'} variant="outlined" />
            </TableCell>
            <TableCell>
                <Button color='secondary' onClick={(evt) => {downloadSessionSets()}}><DownloadIcon /></Button>
            </TableCell>
            <TableCell>
                <ClickAwayListener onClickAway={handleTooltipClose}>
                    <div>
                        <Tooltip
                            PopperProps={{
                                disablePortal: true,
                            }}
                            onClose={handleTooltipClose}
                            open={open}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title="Copied"
                        >
                            <Button color='secondary' onClick={() => { handleTooltipOpen(); copyToClipboard(`https://genesetcart.cfde.cloud/analyze/${session.id}`) }} disabled={session.private}><ShareIcon /></Button>
                        </Tooltip>
                    </div>
                </ClickAwayListener>
            </TableCell>
            <TableCell>
                <Button color='secondary' onClick={(evt) => deleteSession(session)}><DeleteIcon /></Button>
            </TableCell>
        </TableRow>
    )
}

function SessionNameDisplay({ session }: { session: PipelineSession & { gene_sets: GeneSet[] } }) {
    const [editOpen, setEditOpen] = React.useState(false)
    const [sessionNameValue, setSessionNameValue] = React.useState(session.session_name ? session.session_name : session.id)


    const updateSession = React.useCallback(() => {
        if (sessionNameValue !== '') {
            updateSessionName(session.id, sessionNameValue).then((result) => { setEditOpen(false) }).catch((err) => { console.log(err); setEditOpen(false) })
        } else {
            setEditOpen(false)
        }
    }, [session, sessionNameValue])

    const changeAccess = React.useCallback(() => {
        updatePrivacyAccess(session.id)
    }, [session])

    if (!editOpen) {
        return (<div className="display-inline">
            <Link href={`/assemble/${session.id}`} color='secondary'>{session.session_name ? session.session_name : session.id}</Link>
            <Button color='secondary' size={'small'} onClick={() => { setEditOpen(true) }}><EditIcon fontSize="small" /></Button>
            <Button color='secondary' size={'small'} onClick={() => { changeAccess() }}> {session.private ? <LockIcon /> : <LockOpenIcon />} </Button>
        </div>)
    }
    else {
        return (
            <ClickAwayListener onClickAway={() => updateSession()}>
                <TextField
                    inputProps={{ 'aria-label': 'edit name' }}
                    color='secondary'
                    name='sessionName'
                    value={sessionNameValue}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setSessionNameValue(event.target.value);
                    }}
                    onKeyDown={(event) => { if (event.key === 'Enter') { setSessionNameValue((oldValue) => (event.target as HTMLFormElement).value !== '' ? (event.target as HTMLFormElement).value : oldValue); updateSession() } }}
                // onBlur={(evt) => setSessionNameValue(evt.target.value)}
                ></TextField>
            </ClickAwayListener>
        )
    }
}