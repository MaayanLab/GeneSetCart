'use client'
import React from "react";
import { Box, Button, Container, Switch, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import DataTable from "./DataTable";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export type GMTGenesetInfo = {
    id: number,
    genesetName: string,
    genes: string[]
}

export default function MultipleUpload() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [gmtGenesets, setGmtGenesets] = React.useState<GMTGenesetInfo[]>([])
    const [isHumanGenes, setIsHumanGenes] = React.useState(true)


    const readGMTFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        if (fileList) {
            const reader = new FileReader();
            reader.addEventListener(
                "load",
                () => {
                    if (reader.result) {
                        const genesets = reader.result.toString()
                            .split('\n')
                            .map((row, i) => { return { id: i, genesetName: row.split('\t', 1)[0], genes: row.split('\t').slice(1) } })
                        setGmtGenesets(genesets)
                    }
                },
                false,
            );

            if (fileList[0]) {
                reader.readAsText(fileList[0]);
            }
        }
    }


    return (
        <Container>
            <Typography variant="h3" color="secondary.dark" className='p-5'>UPLOAD MULTIPLE GENE SETS</Typography>
            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                Upload an XMT file containing your sets
            </Typography>
            <div className="flex justify-center">
                <Stack direction="column" spacing={1} justifyContent="center" alignItems="center">
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <Tooltip title='Upload .xmt file with sets consisting of other identifiers other than human entrez gene symbols e.g drugs, other organism symbols.'>
                            <HelpOutlineIcon color="secondary" />
                        </Tooltip>
                        <Typography color={'purple'}>Other</Typography>
                        <Switch
                            color="secondary"
                            checked={isHumanGenes}
                            onChange={() => setIsHumanGenes(!isHumanGenes)}
                            sx={{
                                "&.MuiSwitch-root .MuiSwitch-switchBase": {
                                    color: "purple"
                                },

                                "&.MuiSwitch-root .Mui-checked": {
                                    color: "#336699"
                                }
                            }}
                        />
                        <Typography color={'secondary'} >Human Gene Symbols</Typography>
                        <Tooltip title='Upload .xmt file with sets consisting of human entrez gene symbols'>
                            <HelpOutlineIcon color='secondary' />
                        </Tooltip>
                    </Stack>
                    <Button
                        variant="outlined"
                        component="label"
                        color="secondary"
                        sx={{ mt: 3 }}
                    >
                        UPLOAD .XMT FILE
                        <input
                            type="file"
                            hidden
                            onChange={readGMTFile}
                        />
                    </Button>
                </Stack>

            </div>
            <div style={{ height: 600, width: '100%' }} className="mt-2">
                <DataTable rows={gmtGenesets} isHumanGenes={isHumanGenes} />
            </div>

        </Container>
    )
}