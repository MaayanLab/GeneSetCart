import { Container, Typography } from "@mui/material"
import React from "react"

export default async function UseCases() {
  return (
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>USE CASES</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, marginLeft: 3 }}>
                    This page describes some example use cases of the application. 
                </Typography>
            </Container>
    )
}