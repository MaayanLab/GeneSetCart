'use client'

import { Button, Typography } from "@mui/material"
import { beginNewSession } from "./HomePageFunc"

export const StartButton = () => {

    const startSession = () => {
        beginNewSession()
    }

    return (
        <Button variant='contained' size='large' color="secondary" onClick={startSession}> <Typography variant="h5">Start Here</Typography></Button>
    )
}