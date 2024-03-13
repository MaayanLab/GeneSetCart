import Header from "@/components/header/Header"
import { Container, Typography, Grid } from "@mui/material"
import React from "react"

export default async function UseCases({ params }: { params: { id: string } }) {
    return (
        <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>USE CASES</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, marginLeft: 3 }}>
                    This page describes some example use cases of the application.
                </Typography>
            </Container>
        </>
    )
}