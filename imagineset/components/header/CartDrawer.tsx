'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import {Collapse, Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, styled } from '@mui/material';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import { Badge } from '@mui/material'
import { type GeneSet } from '@prisma/client';
import { copyToClipboard } from '../assemble/fileUpload/DataTable';
import { useParams} from 'next/navigation';
import { deleteGenesetByID, getGenesets } from './Header';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePathname } from 'next/navigation';


export function CollapsibleButton({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (
        <Button variant='outlined' color="secondary" onClick={() => setOpen(!open)}>
            {open ? <Typography variant='body2'>Close</Typography> : <Typography variant='body2'>View Genes</Typography>}
        </Button>
    );
}



const GenesetInfo = ({ geneset }: {
    geneset: ({
        genes: {
            id: string;
            gene_symbol: string;
            synonyms: string;
            description: string | null;
        }[];
    } & GeneSet)
}) => {
    const [open, setOpen] = React.useState(false)
    const deleteGeneset = React.useCallback((geneset: ({
        genes: {
            id: string;
            gene_symbol: string;
            synonyms: string;
            description: string | null;
        }[];
    } & GeneSet)) => {
        deleteGenesetByID(geneset.id).then((result) => console.log('deleted') )
    }, [])
    return (
        <>
            <TableRow>
                <TableCell>
                    <Grid container direction='column'>
                        <Grid item>
                            {geneset.name}
                        </Grid>
                        <Grid item>
                            <Typography sx={{ fontSize: 12, color: 'gray' }}>
                                {'Added: ' + geneset.createdAt.toUTCString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </TableCell>
                <TableCell>
                    <CollapsibleButton open={open} setOpen={setOpen} />
                </TableCell>
                <TableCell>
                    <Button color='secondary' onClick={(evt)=> deleteGeneset(geneset)}><DeleteIcon /></Button>
                </TableCell>
            </TableRow>
            {/* <TableRow>
                <TableCell colSpan={2}> */}
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Table>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
                                <Grid item>
                                    <Typography variant='body1' color='secondary'> {geneset.genes.map((gene) => gene.gene_symbol).length.toString()} genes found</Typography>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        id="standard-multiline-static"
                                        multiline
                                        rows={10}
                                        value={geneset.genes.map((gene) => gene.gene_symbol).toString().replaceAll(',', '\n')}
                                        disabled
                                    />
                                </Grid>
                                <Grid item sx={{ mt: 2 }}>
                                    <Button variant='contained' color='primary' onClick={(event) => copyToClipboard(geneset.genes.map((gene) => gene.gene_symbol).toString().replaceAll(',', '\n'))}>
                                        COPY TO CLIPBOARD
                                    </Button>
                                </Grid>
                            </Grid>
                        </TableCell>
                    </TableRow>
                </Table>
            </Collapse>
            {/* </TableCell>
            </TableRow> */}

        </>

    )
}
const DrawerInfo = ({ genesets }: {
    genesets: ({
        genes: {
            id: string;
            gene_symbol: string;
            synonyms: string;
            description: string | null;
        }[];
    } & GeneSet)[] | null
}) => {
    return (
        <Box
            sx={{ width: 500 }}
            role="presentation"
        >
            <center>
                <Typography variant='h4' sx={{ mt: 2, fontWeight: 'bold' }} color={'secondary'}> MY GENE SETS ({genesets?.length.toString()})</Typography>
            </center>

            <Table sx={{ p: 2 }}>
                <TableBody>
                    {genesets?.map((geneset) =>
                        <GenesetInfo key={geneset.id} geneset={geneset} />
                    )}

                </TableBody>
            </Table>
            <center>
                {((genesets?.length === 0) || (!genesets)) && <Typography variant='body1'> No added gene sets in session</Typography>}
            </center>
        </Box>
    )
};

type SessionInfo = {
    gene_sets: ({
        genes: {
            id: string;
            gene_symbol: string;
            synonyms: string;
            description: string | null;
        }[];
    } & GeneSet)[]
}


export default function CartDrawer({getSessionInfo}: {getSessionInfo: (sessionId: string) =>  Promise<{
    gene_sets: ({
        genes: {
            id: string;
            gene_symbol: string;
            synonyms: string;
            description: string | null;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        session_id: string;
        createdAt: Date;
    })[];
} | null>
    }) {
    const currentPage = usePathname();
    const sessionId = currentPage.split('/')[2]
    const [sessionInfo, setSessionInfo] = React.useState<SessionInfo | null >(null)
    React.useEffect(() => {
        if (currentPage.split('/').length === 3) {
            getSessionInfo(sessionId).then((result) => setSessionInfo(result))
        } 
    }, [sessionInfo])    

    const [sessionGeneset, setSessionGenesets] = React.useState<({
        genes: {
            id: string;
            gene_symbol: string;
            synonyms: string;
            description: string | null;
        }[];
    } & GeneSet)[]>([])

    const params = useParams<{ id: string }>()
    React.useEffect(() => {
        getGenesets(params.id)
            .then((result) => { setSessionGenesets(result) })
    }, [sessionInfo])

    const [state, setState] = React.useState(false);
    if (currentPage.split('/').length === 3) {
        const toggleDrawer =
            (open: boolean) =>
                (event: React.KeyboardEvent | React.MouseEvent) => {
                    if (
                        event.type === 'keydown' &&
                        ((event as React.KeyboardEvent).key === 'Tab' ||
                            (event as React.KeyboardEvent).key === 'Shift')
                    ) {
                        return;
                    }
    
                    setState(open);
                };
    
        return (
            <div>
                <Button onClick={toggleDrawer(true)}>
                    <Badge badgeContent={sessionGeneset.length.toString()} color="primary">
                        <CollectionsBookmarkIcon color='secondary' />
                    </Badge>
                </Button>
                <Drawer
                    anchor={'left'}
                    open={state}
                    onClose={toggleDrawer(false)}
                >
                    <DrawerInfo genesets={sessionGeneset} />
                </Drawer>
            </div>
        );
    }  else {return <></>}
    }

    