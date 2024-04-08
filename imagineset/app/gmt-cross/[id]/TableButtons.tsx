'use client'
import { Box, Button, Dialog, DialogTitle, Grid, TextField, Typography } from "@mui/material";
import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import React from "react";
import { fetchGenes } from "@/app/gmt-cross/[id]/GMTCrossFunctions";
import { copyToClipboard } from "@/components/assemble/DCCFetch/CFDEDataTable";
import { enrich } from "@/app/analyze/[id]/ViewGenesBtn";
import { addToSessionSets, checkInSession } from "@/app/assemble/[id]/AssembleFunctions ";
import { addStatus } from "@/components/assemble/fileUpload/SingleUpload";
import Status from "@/components/assemble/Status";

export const RenderGeneSet1 = ({ params, sessionId }: { params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>, sessionId: string }) => {
    const [open, setOpen] = React.useState(false);
    const [genesetGenes, setGenesetGenes] = React.useState<string[]>([])
    const [status, setStatus] = React.useState<addStatus>({})


    React.useEffect(() => {
        fetchGenes(params.row.geneset_1).then((result) => setGenesetGenes(result))
    }, [])

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const copyClipboardFunc = React.useCallback(() => {
        copyToClipboard(genesetGenes.join('\n').replaceAll("'", ""))
    }, [genesetGenes])

    return <React.Fragment>
        <Button
            sx={{ color: "black" }}
            size="small"
            onClick={(event) => { event.stopPropagation(); handleOpen() }}>
            <Typography>
                {params.row.geneset_1}
            </Typography>
            &nbsp;
            <Typography color='secondary' sx={{ fontSize: 12 }}>
                ({params.row.n_genes1})
            </Typography>
        </Button>
        <Dialog
            onClose={handleClose}
            open={open}>
            <DialogTitle>{params.row.geneset_1}</DialogTitle>
            <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
                <Grid item>
                    <Typography variant='body1' color='secondary'> {params.row.n_genes1} genes found</Typography>
                </Grid>
                <Grid item>
                    <TextField
                        id="standard-multiline-static"
                        multiline
                        rows={10}
                        value={genesetGenes.toString().replaceAll(',', '\n').replaceAll("'", '')}
                        disabled
                    />
                </Grid>
                <Grid item container spacing={1} sx={{ mt: 2 }} justifyContent="center" alignItems={'center'}>
                    <Grid item>
                        <Button variant='contained' color='primary' onClick={(event) => copyClipboardFunc()}>
                            COPY TO CLIPBOARD
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained' color='primary'
                            onClick={(evt) => {
                                enrich({ list: genesetGenes.join('\n').replaceAll("'", "") || '', description: params.row.geneset_1 })
                            }}
                        >
                            SEND TO ENRICHR
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained' color='primary'
                            onClick={(evt) => {
                                const genesetName = params.row.geneset_1
                                checkInSession(sessionId, genesetName).then((response) => {
                                    if (response) {
                                        setStatus({ error: { selected: true, message: "Gene set already exists in this session!" } })
                                    } else {
                                        addToSessionSets(genesetGenes.toString().replaceAll("'", '').split(','), sessionId, genesetName, '').then((result) => { setStatus({ success: true }) }).catch((err) => setStatus({ error: { selected: true, message: "Error in adding gene set!" } }))
                                    }
                                })
                            }}
                        >
                            ADD TO CART
                        </Button>
                    </Grid>
                </Grid>
                <Grid item>
                    <Status status={status} />
                </Grid>
            </Grid>
        </Dialog>
    </React.Fragment>
}

export const RenderGeneSet2 = ({ params, sessionId }: { params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>, sessionId: string }) => {
    const [open, setOpen] = React.useState(false);
    const [genesetGenes, setGenesetGenes] = React.useState<string[]>([])
    const [status, setStatus] = React.useState<addStatus>({})

    React.useEffect(() => {
        fetchGenes(params.row.geneset_2).then((result) => setGenesetGenes(result))
    }, [])

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const copyClipboardFunc = React.useCallback(() => {
        copyToClipboard(genesetGenes.join('\n').replaceAll("'", ""))
    }, [genesetGenes])

    return <React.Fragment>
        <Button
            sx={{ color: "black" }}
            size="small"
            onClick={(event) => { event.stopPropagation(); handleOpen() }}>
            <Typography>
                {params.row.geneset_2}
            </Typography>
            &nbsp;
            <Typography color='secondary' sx={{ fontSize: 12 }}>
                ({params.row.n_genes2})
            </Typography>
        </Button>
        <Dialog
            onClose={handleClose}
            open={open}>
            <DialogTitle>{params.row.geneset_2}</DialogTitle>
            <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
                <Grid item>
                    <Typography variant='body1' color='secondary'> {params.row.n_genes2} genes found</Typography>
                </Grid>
                <Grid item>
                    <TextField
                        id="standard-multiline-static"
                        multiline
                        rows={10}
                        value={genesetGenes.toString().replaceAll(',', '\n').replaceAll("'", '')}
                        disabled
                    />
                </Grid>
                <Grid item container spacing={1} sx={{ mt: 2 }} justifyContent="center" alignItems={'center'}>
                    <Grid item>
                        <Button variant='contained' color='primary' onClick={(event) => copyClipboardFunc()}>
                            COPY TO CLIPBOARD
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained' color='primary'
                            onClick={(evt) => {
                                enrich({ list: genesetGenes.join('\n').replaceAll("'", "") || '', description: params.row.geneset_2 })
                            }}
                        >
                            SEND TO ENRICHR
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained' color='primary'
                            onClick={(evt) => {
                                const genesetName = params.row.geneset_2
                                checkInSession(sessionId, genesetName).then((response) => {
                                    if (response) {
                                        setStatus({ error: { selected: true, message: "Gene set already exists in this session!" } })
                                    } else {
                                        addToSessionSets(genesetGenes.toString().replaceAll("'", '').split(','), sessionId, genesetName, '').then((result) => { setStatus({ success: true }) }).catch((err) => setStatus({ error: { selected: true, message: "Error in adding gene set!" } }))
                                    }
                                })
                            }}
                        >
                            ADD TO CART
                        </Button>
                    </Grid>
                </Grid>
                <Grid item>
                    <Status status={status} />
                </Grid>
            </Grid>
        </Dialog>
    </React.Fragment>
}


export const RenderOverlapButton = ({ params, sessionId }: { params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>, sessionId: string }) => {
    const [open, setOpen] = React.useState(false);
    const [status, setStatus] = React.useState<addStatus>({})

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const copyClipboardFunc = React.useCallback(() => {
        copyToClipboard(params.row.overlap.join('\n').replaceAll("'", ""))
    }, [params.row.overlappingGenes, params.row.overlap])
    return (
        <React.Fragment>
            <Button
                color="tertiary"
                size="small"
                style={{ textDecoration: 'underline' }}
                onClick={(event) => { event.stopPropagation(); handleOpen() }}>
                {params.row.n_overlap}
            </Button>
            <Dialog
                onClose={handleClose}
                open={open}>
                <DialogTitle>{params.row.geneset_1 + ' ∩ ' + params.row.geneset_2}</DialogTitle>
                <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
                    <Grid item>
                        <Typography variant='body1' color='secondary'> {params.row.n_overlap} genes found</Typography>
                    </Grid>
                    <Grid item>
                        <TextField
                            id="standard-multiline-static"
                            multiline
                            rows={10}
                            value={params.row.overlap.toString().replaceAll(',', '\n').replaceAll("'", '')}
                            disabled
                        />
                    </Grid>
                    <Grid item container spacing={1} sx={{ mt: 2 }} justifyContent="center" alignItems={'center'}>
                        <Grid item>
                            <Button variant='contained' color='primary' onClick={(event) => copyClipboardFunc()}>
                                COPY TO CLIPBOARD
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant='contained' color='primary'
                                onClick={(evt) => {
                                    enrich({ list: params.row.overlap.join('\n').replaceAll("'", "") || '', description: params.row.geneset_1 + ' Intersection ' + params.row.geneset_2 })
                                }}
                            >
                                SEND TO ENRICHR
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant='contained' color='primary'
                                onClick={(evt) => {
                                    const genesetName = params.row.geneset_1 + ' Intersection ' + params.row.geneset_2
                                    checkInSession(sessionId, genesetName).then((response) => {
                                        if (response) {
                                            setStatus({ error: { selected: true, message: "Gene set already exists in this session!" } })
                                        } else {
                                            addToSessionSets(params.row.overlap.toString().replaceAll("'", '').split(','), sessionId, genesetName, '').then((result) => { setStatus({ success: true }) }).catch((err) => setStatus({ error: { selected: true, message: "Error in adding gene set!" } }))
                                        }
                                    })
                                }}
                            >
                                ADD TO CART
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Status status={status} />
                    </Grid>
                </Grid>
            </Dialog>
        </React.Fragment>
    )
}