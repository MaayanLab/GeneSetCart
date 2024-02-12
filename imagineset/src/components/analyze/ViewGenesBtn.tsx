'use client'
import { Button, Collapse, Dialog, DialogTitle, IconButton, Typography, Grid, TextField, Table, Box, TableBody, TableCell, TableRow, Link, Stack } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import React from "react";
import { copyToClipboard } from "../assemble/fileUpload/DataTable";
import { GeneSet, Gene } from "@prisma/client";
import Image from "next/image";


import enrichrLogo from "@/public/img/otherLogos/enrichrIcon.png"
import enrichrKgLogo from "@/public/img/otherLogos/enrichrkgLogo.png"
import rummageneLogo from "@/public/img/otherLogos/rummageneLogo.png"
import kea3Logo from "@/public/img/otherLogos/KEA3Logo.png"
import chea3logo from "@/public/img/otherLogos/chea3Logo.png"



export const ViewGenesBtn = ({ row }: {
    row: {
        genes: Gene[];
    } & GeneSet
}) => {
    const [open, setOpen] = React.useState(false)
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <React.Fragment>
            <Button variant='outlined' color='secondary' sx={{ borderRadius: 1 }} onClick={() => setOpen(true)}>
                View Genes
            </Button>
            <Dialog
                onClose={handleClose}
                open={open}>
                <DialogTitle>{row.name}</DialogTitle>
                <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
                    <Grid item>
                        <Typography variant='body1' color='secondary'> {row.genes.length} genes</Typography>
                    </Grid>
                    <Grid item>
                        <TextField
                            id="standard-multiline-static"
                            multiline
                            rows={10}
                            placeholder="Paste gene symbols here"
                            value={row.genes.map((gene) => gene.gene_symbol).toString().replaceAll(',', '\n')}
                            disabled
                        />
                    </Grid>
                    <Grid item sx={{ mt: 2 }}>
                        <Button variant='contained' color='primary' onClick={(event) => copyToClipboard(row.genes.map((gene) => gene.gene_symbol).toString().replaceAll(',', '\n'))}>
                            COPY TO CLIPBOARD
                        </Button>
                    </Grid>
                </Grid>
            </Dialog>
        </React.Fragment>
    )
}



export const DeleteBtn = () => {
    return (
        <Button variant='outlined' color='secondary' sx={{ borderRadius: 1 }}>
            <DeleteIcon />
        </Button>
    )
}

export const AnalysisBtns = () => {
    return (
        <Stack spacing={1}>
            <Button variant='outlined' sx={{ borderColor: '#8B0000' }}>
                <div>
                    <Image src={enrichrLogo} width={30} alt="enrichr logo"></Image>
                </div><Typography sx={{color: '#8B0000', fontSize: 13}}>
                Enrichr
                </Typography>
                
            </Button>
            <Button variant="contained" sx={{backgroundColor: '#000000'}}>
                <div>
                    <Image src={enrichrKgLogo} width={30} alt="enrichr=kg logo"></Image>
                </div><Typography sx={{color: '#FFFFFF', fontSize: 13}}>Enrichr-KG</Typography>
            </Button>
            <Button variant="contained" sx={{backgroundColor: '#000000'}}>
                <div>
                    <Image src={rummageneLogo} width={40} alt="rummagene logo"></Image>
                </div><Typography sx={{color: '#FFFFFF', fontSize: 13}}>Rummagene</Typography>
            </Button>
            <Button variant="outlined" color='secondary'>
                <div className="mx-1">
                    <Image src={kea3Logo} width={20} alt="kea3 logo"></Image>
                </div> <Typography sx={{fontSize: 13}}>KEA3</Typography>
            </Button>
            <Button variant='outlined' sx={{ borderColor: '#000000' }}>
                <div>
                    <Image src={chea3logo} width={30} alt="chea3 logo"></Image>
                </div> <Typography sx={{color:"#000000", fontSize: 13}}>ChEA3</Typography>
            </Button>
        </Stack>
    )
}


export function CollapsibleArrow() {
    const [open, setOpen] = React.useState(false)
    return (
        <React.Fragment>
            <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
            >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <Collapse in={open} timeout="auto"
                unmountOnExit>
                <Box sx={{ margin: 1 }}>
                    <Typography variant="h6" gutterBottom component="div">
                        Analyze
                    </Typography>
                    <Table>
                        <TableRow>
                            <TableCell variant="head">File</TableCell>
                            {/* <TableCell><Link color="secondary" href={props.fileInfo.link} target="_blank" rel="noopener" style={{ width: 200 }}>{props.fileInfo.filename}</Link></TableCell> */}
                        </TableRow>
                    </Table>
                </Box>
            </Collapse>
        </React.Fragment>
    );
}