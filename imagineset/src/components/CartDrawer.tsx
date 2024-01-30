'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import { Accordion, AccordionDetails, AccordionSummary, Collapse, Grid, ListItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import { Badge } from '@mui/material'
import { type GeneSet } from '@prisma/client';


export function CollapsibleButton({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    return (
        <Button variant='outlined' color="secondary" onClick={() => setOpen(!open)}>
            {open ? <Typography>Close</Typography> : <Typography>View Genes</Typography>}
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
                                Added: {geneset.createdAt.toUTCString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </TableCell>
                <TableCell>
                    <CollapsibleButton open={open} setOpen={setOpen} />
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
                                                placeholder="Paste gene symbols here"
                                                value={geneset.genes.map((gene) => gene.gene_symbol).toString().replaceAll(',', '\n')}
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item sx={{ mt: 2 }}>
                                            <Button variant='contained' color='primary'>
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
                        <GenesetInfo geneset={geneset} />
                    )}

                </TableBody>
            </Table>
            <center>
                {((genesets?.length === 0) || (!genesets)) && <Typography variant='body1'> No added gene sets in session</Typography>}
            </center>
        </Box>
    )
};


export default function CartDrawer({ genesetNum, genesets }: {
    genesetNum: number, genesets: ({
        genes: {
            id: string;
            gene_symbol: string;
            synonyms: string;
            description: string | null;
        }[];
    } & GeneSet)[] | null
}) {
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
                <Badge badgeContent={genesetNum.toString()} color="primary">
                    <CollectionsBookmarkIcon color='secondary' />
                </Badge>
            </Button>
            <Drawer
                anchor={'left'}
                open={state}
                onClose={toggleDrawer(false)}
            >
                <DrawerInfo genesets={genesets} />
            </Drawer>
        </div>
    );
}