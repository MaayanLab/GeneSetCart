'use client'

import { Button, Typography } from "@mui/material"
import { beginNewSession } from "./HomePageFunc"

export const StartButton = () => {

    const startSession = () => {
        beginNewSession()
    }

    return (
        <Button variant='contained' size='large' color="secondary" onClick={startSession} sx={{borderRadius: 5, marginTop: 3, height: '60px', width: '200px'}}> <Typography variant="h5">Get Started</Typography></Button>
    )
}