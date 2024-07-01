'use client'
import { Button, Collapse, Dialog, DialogTitle, IconButton, Typography, Grid, TextField, Table, Box, TableBody, TableCell, TableRow, Link, Stack } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import React from "react";
import { copyToClipboard } from "../../../components/assemble/fileUpload/DataTable";
import { GeneSet, Gene } from "@prisma/client";
import Image from "next/image";
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';


import enrichrLogo from "@/public/img/otherLogos/enrichrIcon.png"
import enrichrKgLogo from "@/public/img/otherLogos/enrichrkgLogo.png"
import rummageneLogo from "@/public/img/otherLogos/rummageneLogo.png"
import rummageoLogo from "@/public/img/otherLogos/rummageoLogo.webp"
import kea3Logo from "@/public/img/otherLogos/KEA3Logo.png"
import chea3logo from "@/public/img/otherLogos/chea3Logo.png"
import SigcomLincsLogo from "@/public/img/otherLogos/sigcomLincsLogo.svg"
import playbookLogo from "@/public/img/otherLogos/playbook-workflow-builder.png"
import cfdeLogo from "@/public/img/favicon.png"
import { getEnrichrShortId, getPlaybookLink, getRummageneLink, getRummageoLink, getSigComLINCSId } from "@/app/analyze/[id]/AnalyzeFunctions";
import { deleteGenesetByID } from "@/components/header/Header";



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
                <DialogTitle sx={{wordBreak: 'break-word'}}>{row.name}</DialogTitle>
                <Grid container sx={{ p: 2 }} justifyContent="center" direction='column' alignItems={'center'}>
                    <Grid item>
                        <Typography variant='body1' color='secondary'> {row.genes.length} genes</Typography>
                    </Grid>
                    <Grid item>
                        <TextField
                            id="standard-multiline-static"
                            multiline
                            rows={10}
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



export const DeleteBtn = ({ row }: {
    row: {
        genes: Gene[];
    } & {
        id: string;
        name: string;
        description: string | null;
        session_id: string;
        createdAt: Date;
    }
}) => {
    return (
        <Button variant='outlined' color='secondary' sx={{ borderRadius: 1 }} onClick={() => deleteGenesetByID(row.id).then(() => console.log('deleted'))}>
            <DeleteIcon />
        </Button>
    )
}



export function enrich(options: any) {
    if (typeof options.list === 'undefined') {
        alert('No genes defined.');
        return;
    }

    var description = options.description || "",
        form = document.createElement('form'),
        listField = document.createElement('input'),
        descField = document.createElement('input');

    form.setAttribute('method', 'post');
    form.setAttribute('action', 'https://maayanlab.cloud/Enrichr/enrich');
    form.setAttribute('target', '_blank');
    form.setAttribute('enctype', 'multipart/form-data');
    listField.setAttribute('type', 'hidden');
    listField.setAttribute('name', 'list');
    listField.setAttribute('value', options.list);
    form.appendChild(listField);
    descField.setAttribute('type', 'hidden');
    descField.setAttribute('name', 'description');
    descField.setAttribute('value', description);
    form.appendChild(descField);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}


const options = [<>
    <div>
        <SigcomLincsLogo style={{ width: 20, height: 20 }} />
    </div>&nbsp;<Typography sx={{ color: "#000000", fontSize: 13 }}>SigCom LINCS</Typography></>,
<>
    <div>
        <Image src={cfdeLogo} width={30} alt="cfde-gse logo"></Image>
    </div>&nbsp;<Typography sx={{ fontSize: 13 }}>CFDE GSE</Typography>
</>,
<>
    <div>
        <Image src={playbookLogo} width={30} alt="playbook logo"></Image>
    </div>&nbsp;<Typography sx={{ fontSize: 13 }}>Playbook</Typography>
</>,
<>
    <div>
        <Image src={rummageneLogo} width={30} alt="rummagene logo"></Image>
    </div>&nbsp;<Typography sx={{ fontSize: 13 }}>Rummagene</Typography>
</>,
<>
    <div>
        <Image src={rummageoLogo} width={30} alt="rummageo logo"></Image>
    </div>&nbsp;<Typography sx={{ fontSize: 13 }}>Rummageo</Typography>
</>,
<>
    <div className="mx-1">
        <Image src={kea3Logo} width={20} alt="kea3 logo"></Image>
    </div>&nbsp;<Typography sx={{ fontSize: 13 }}>KEA3</Typography>
</>,
<>
    <div>
        <Image src={chea3logo} width={30} alt="chea3 logo"></Image>
    </div>&nbsp;<Typography sx={{ color: "#000000", fontSize: 13 }}>ChEA3</Typography></>,
<>
    <div>
        <Image src={enrichrKgLogo} width={30} alt="enrichr-kg logo"></Image>
    </div>&nbsp;<Typography sx={{ fontSize: 13 }}>Enrichr-KG</Typography>
</>,
<>
    <div>
        <Image src={enrichrLogo} width={30} alt="enrichr logo"></Image>
    </div>&nbsp;<Typography sx={{ fontSize: 13 }}>
        Enrichr
    </Typography>
</>
];

const buttonOptions = ['SigCom LINCS', 'CFDE GSE', 'Playbook', 'Rummagene', 'Rummageo', 'KEA3', 'ChEA3', 'Enrichr-KG', 'Enrichr']

export function SplitButton({ row }: {
    row: {
        genes: Gene[];
    } & GeneSet
}) {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const handleClick = (selectedIndex: number) => {
        const selectedButton = buttonOptions[selectedIndex]
        if (selectedButton === 'Enrichr') {
            const genes = row.genes.map((gene) => gene.gene_symbol)
            const newSetName = row.name.replaceAll('∩', 'INTERSECT').replaceAll('∪', 'UNION')
            enrich({ list: genes?.join('\n') || '', description: newSetName })
        } else if (selectedButton === 'Rummagene') {
            getRummageneLink(row.name, row.genes.map((gene) => gene.gene_symbol)).then((link) => window.open(link, "_blank"))
        } else if (selectedButton === 'Rummageo') {
            getRummageoLink(row.name, row.genes.map((gene) => gene.gene_symbol)).then((link) => window.open(link, "_blank"))
        }
        else if (selectedButton === 'KEA3') {
            const genes = row.genes.map((gene) => gene.gene_symbol)
            const inputvalue = genes.join("%0A")
            const keaLink = "https://appyters.maayanlab.cloud/KEA3_Appyter/#/?args.Input%20gene/protein%20list=" + inputvalue + "&submit"
            window.open(keaLink, "_blank")
        } else if (selectedButton === 'ChEA3') {
            const genes = row.genes.map((gene) => gene.gene_symbol)
            const inputvalue = genes.join("%0A")
            const cheaLink = "https://appyters.maayanlab.cloud/ChEA3_Appyter/#/?args.paste_gene_input=" + inputvalue + "&submit"
            window.open(cheaLink, "_blank")
        } else if (selectedButton === 'Enrichr-KG') {
            const genes = row.genes.map((gene) => gene.gene_symbol)
            const newSetName = row.name.replaceAll('∩', 'INTERSECT').replaceAll('∪', 'UNION')
            getEnrichrShortId(newSetName, genes).then((userListId) => window.open('https://maayanlab.cloud/enrichr-kg?userListId=' + userListId, "_blank"))
        }
        else if (selectedButton === 'SigCom LINCS') {
            const genes = row.genes.map((gene) => gene.gene_symbol)
            getSigComLINCSId(row.name, genes).then((datasetId) => window.open('https://maayanlab.cloud/sigcom-lincs/#/SignatureSearch/Set/' + datasetId, "_blank"))
        } else if (selectedButton === 'CFDE GSE') {
            const genes = row.genes.map((gene) => gene.gene_symbol)
            const newSetName = row.name.replaceAll('∩', 'INTERSECT').replaceAll('∪', 'UNION')
            getEnrichrShortId(newSetName, genes).then((userListId) => window.open(`https://gse.cfde.cloud/?q={%22min_lib%22:1,%22libraries%22:[{%22name%22:%22LINCS_L1000_Chem_Pert_Consensus_Sigs%22,%22limit%22:5},{%22name%22:%22HuBMAP_ASCTplusB_augmented_2022%22,%22limit%22:5}],%22userListId%22:%22${userListId}%22,%22search%22:true}`, "_blank"))
        } else if (selectedButton === 'Playbook') {
            getPlaybookLink(row.name.replaceAll('∩', 'INTERSECT').replaceAll('∪', 'UNION'), row.genes.map((gene) => gene.gene_symbol)).then((link) => window.open(link, '_blank'))
        }
    };

    const handleMenuItemClick = (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        index: number,
    ) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <ButtonGroup
                variant="outlined"
                color="secondary"
                ref={anchorRef}
                aria-label="Button group with a nested menu"
                sx={{ borderRadius: 1 }}
            >
                <Button onClick={(evt) => handleClick(selectedIndex)}>{options[selectedIndex]}</Button>
                <Button
                    size="small"
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{
                    zIndex: 1,
                }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={index}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {option}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    );
}