"use client"

import { Typography, Box, Button } from "@mui/material"
import LaunchIcon from '@mui/icons-material/Launch';


export function UseCaseContent({ description, launchLink }: { description: string, launchLink: string }) {
    return (
        <Box sx={{ p: 1, m: 1, display: 'block', justifyContent: 'center' }}>
            <Typography style={{ textAlign: 'left' }} variant='body1' sx={{ fontWeight: 'bold', borderBottom: 1 }}>Description</Typography>
            <Typography sx={{ textAlign: 'left' }} className="p-2" color="#374151">
                {description}
            </Typography>
            <Button color='secondary' size='large' variant="contained" onClick={() => window.open(launchLink, '_blank')}> <LaunchIcon /> &nbsp; LAUNCH </Button>
        </Box>
    )
}

export function UseCaseContent2({ description, launchLink }: { description: React.ReactNode, launchLink: string }) {
    return (
        <Box sx={{ p: 1, m: 1, display: 'block', justifyContent: 'center' }}>
                {description}
            <Button color='secondary' size='large' variant="contained" onClick={() => window.open(launchLink, '_blank')}> <LaunchIcon /> &nbsp; LAUNCH </Button>
        </Box>
    )
}