"use client"
import { Button } from "@mui/material";

export function ReportButton(){
    return (
        <Button variant="outlined" color="secondary" fullWidth sx={{marginBottom: 3}}>
            Generate Playbook Report
        </Button>
    )
}