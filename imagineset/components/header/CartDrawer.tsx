'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { Collapse, Grid, Stack, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { Badge } from '@mui/material'
import { Gene, type GeneSet } from '@prisma/client';
import { copyToClipboard } from '../assemble/fileUpload/DataTable';
import { deleteGenesetByID, getGenesets } from './Header';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadURI } from '@/app/visualize/[id]/VisualizeLayout';


export function CollapsibleButton({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (
        <Button variant='outlined' color="secondary" onClick={() => setOpen(!open)}>
            {open ? <Typography variant='body2'>Close</Typography> : <Typography variant='body2'>View Genes</Typography>}
        </Button>
    );
}



const GenesetInfo = ({ geneset }: {
    geneset: ({
        genes: Gene[];
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
        deleteGenesetByID(geneset.id).then((result) => console.log('deleted'))
    }, [])
    const displayedSymbols = geneset.isHumanGenes ? geneset.genes.map((gene) => gene.gene_symbol) : geneset.otherSymbols
    return (
        <>
            <TableRow>
                <>
                    <TableCell>
                        <Grid container direction='column' sx={{ width: 250 }}>
                            <Grid item zeroMinWidth sx={{
                                whiteSpace: 'normal',
                                overflowWrap: 'anywhere', // Force text wrap
                            }}>
                                <Typography>{geneset.name}</Typography>
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
                        <Button color='secondary' onClick={(evt) => deleteGeneset(geneset)}><DeleteIcon /></Button>
                    </TableCell>
                </>
            </TableRow>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Table>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
                                <Grid item>
                                    <Typography variant='body1' color='secondary'> {displayedSymbols.length.toString()} {geneset.isHumanGenes ? 'genes' : 'items'}  found</Typography>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        id="standard-multiline-static"
                                        multiline
                                        rows={10}
                                        value={displayedSymbols.toString().replaceAll(',', '\n')}
                                        disabled
                                    />
                                </Grid>
                                <Grid item sx={{ mt: 2 }}>
                                    <Button variant='contained' color='primary' onClick={(event) => copyToClipboard(displayedSymbols.toString().replaceAll(',', '\n'))}>
                                        COPY TO CLIPBOARD
                                    </Button>
                                </Grid>
                            </Grid>
                        </TableCell>
                    </TableRow>
                </Table>
            </Collapse>
        </>

    )
}
const DrawerInfo = ({ genesets, sessionId, sessionName }: {
    genesets: ({
        genes: Gene[];
    } & GeneSet)[] | null; 
    sessionId: string | null
    sessionName: string | null
}) => {
    const downloadSessionSets = () => {
        let gmtContent = "data:text/gmt;charset=utf-8," 
        + genesets?.map((gene_set, index) => {
            const genes = gene_set.isHumanGenes ? gene_set?.genes.map((gene) => gene.gene_symbol) : gene_set.otherSymbols
            const GMTInfo = (index === 0) ? gene_set?.name + '\t' + genes?.join('\t') : '\n' + gene_set?.name + '\t' + genes?.join('\t')
            return GMTInfo
        })
        downloadURI(gmtContent, sessionName ? sessionName : 'Unnamed_GMT' + '.gmt')
    }

    return (
        <Box
            sx={{ width: {xs:200, md: 500}}}
            role="presentation"
        >
            <center>
                <Typography variant='h4' sx={{ mt: 2, fontWeight: 'bold' }} color={'secondary'}> MY GENE SETS ({genesets?.length.toString()}) <Button color='secondary' onClick={(evt) => {downloadSessionSets()}}><DownloadIcon /></Button></Typography> 
            </center>
            <Stack direction='row' sx={{ justifyContent: 'center', marginTop: 1 }} spacing={1}>
                <Button variant='outlined' color='secondary' sx={{ borderRadius: 4 }} size='small' href={`/augment/${sessionId}`}> Augment &nbsp; <LaunchIcon fontSize={'small'} /></Button>
                <Button variant='outlined' color='secondary' sx={{ borderRadius: 4 }} size='small' href={`/combine/${sessionId}`}>Combine  &nbsp; <LaunchIcon fontSize={'small'} /></Button>
                <Button variant='outlined' color='secondary' sx={{ borderRadius: 4 }} size='small' href={`/visualize/${sessionId}`}>Visualize  &nbsp; <LaunchIcon fontSize={'small'} /></Button>
                <Button variant='outlined' color='secondary' sx={{ borderRadius: 4 }} size='small' href={`/analyze/${sessionId}`}>Analyze  &nbsp; <LaunchIcon fontSize={'small'} /></Button>
            </Stack>

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



export default function CartDrawer({ sessionInfo }: {
    sessionInfo: {
        id: string;
        session_name: string | null;
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null
}) {

    const sessionGenesets = sessionInfo ? sessionInfo.gene_sets : null
    const [state, setState] = React.useState(false);
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
                <Badge badgeContent={sessionGenesets ? sessionGenesets.length.toString() : '0'} color="primary">
                    <ShoppingCartIcon color='secondary' sx={{fontSize: 30}} />
                </Badge>
            </Button>
            <Drawer
                anchor={'left'}
                open={state}
                onClose={toggleDrawer(false)}
            >
                <DrawerInfo genesets={sessionGenesets ? sessionGenesets : null} sessionId={sessionInfo ? sessionInfo.id : null} sessionName={sessionInfo ? sessionInfo.session_name : null}/>
            </Drawer>
        </div>
    );
}

