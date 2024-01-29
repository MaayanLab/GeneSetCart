'use client'
import React from "react";
import { Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import DataTable from "./DataTable";


export default function MultipleUpload() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Container>
            <Typography variant="h3" color="secondary.dark" className='p-5'>UPLOAD MULTIPLE GENE SETS</Typography>
            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                Upload a .gmt file containing your gene sets
            </Typography>
            <DataTable />
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
                />
            </Button>
            </div>

        </Container>
    )
}