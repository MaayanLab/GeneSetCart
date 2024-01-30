'use client'
import React from "react";
import { Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import DataTable from "./DataTable";

export type GMTGenesetInfo = {
    id: number,
    genesetName: string, 
    genes: string []
}
export default function MultipleUpload() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [gmtGenesets, setGmtGenesets] = React.useState<GMTGenesetInfo[]>([])

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
                        .map((row, i)=> {return {id: i, genesetName: row.split('\t', 1)[0], genes: row.split('\t').slice(1)}})
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
                Upload a .gmt file containing your gene sets
            </Typography>
            <DataTable rows={gmtGenesets}/>
            <div className="flex justify-center">
            <Button
                variant="contained"
                component="label"
                color="secondary"
                sx={{mt: 3, }}
            >
                Upload .gmt File
                <input
                    type="file"
                    hidden
                    onChange={readGMTFile}
                />
            </Button>
            </div>

        </Container>
    )
}