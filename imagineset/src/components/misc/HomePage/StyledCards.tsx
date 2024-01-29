'use client'
import React from "react";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Typography } from "@mui/material";

export default function StyledCard() {

    const Item = styled(Paper)(() => ({
        backgroundColor: '#cee1f5',
        padding: 8,
        textAlign: 'center',
        color: 'black',
        minHeight: '12vw',
        minWidth: '3vw'
    }));

    return (
        <>
            <Grid container spacing={4}>

                <Grid item xs={4}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'>
                            ASSEMBLE
                        </Typography>
                    </Item>
                </Grid>

                <Grid item xs={4}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'>
                            AUGMENT
                        </Typography>
                        </Item>
                </Grid>

                <Grid item xs={4}>
                    <Item elevation={3}>                        
                    <Typography variant='h4' color='secondary.dark'>
                        COMBINE
                    </Typography>
                    </Item>
                </Grid>

                <Grid item xs={6}>
                <Item elevation={3}>                        
                    <Typography variant='h4' color='secondary.dark'>
                        VISUALIZE
                    </Typography>
                    </Item>
                </Grid>

                <Grid item xs={6}>
                <Item elevation={3}>                        
                    <Typography variant='h4' color='secondary.dark'>
                        ANALYZE
                    </Typography>
                    </Item>
                </Grid>

            </Grid>
        </>
    )
}
