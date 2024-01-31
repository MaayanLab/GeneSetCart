'use client'
import React from "react";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Typography } from "@mui/material";
import assembleIcon from "@/public/img/otherLogos/assembleIcon.png"
import visualizeIcon from "@/public/img/otherLogos/visualizeIcon.png"
import augmentIcon from "@/public/img/otherLogos/augmentIcon.png"
import analyzeIcon from "@/public/img/otherLogos/analyzeIcon.png"
import combineIcon from "@/public/img/otherLogos/combineIcon.png"
import Image from "next/image";
export default function StyledCard() {

    const Item = styled(Paper)(() => ({
        backgroundColor: '#cee1f5',
        padding: 8,
        textAlign: 'center',
        color: 'black',
        minHeight: '12vw',
        minWidth: '3vw',
    }));

    return (
        <>
            <Grid container spacing={4}>

                <Grid item xs={4}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'>
                            ASSEMBLE
                        </Typography>
                        <div className="flex justify-center align-center mt-6">
                            <div className="flex w-5/12">
                                <Image src={assembleIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                </Grid>

                <Grid item xs={4}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'>
                            AUGMENT
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12">
                                <Image src={augmentIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                </Grid>

                <Grid item xs={4}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'>
                            COMBINE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12">
                                <Image src={combineIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                </Grid>

                <Grid item xs={6}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'>
                            VISUALIZE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-3/12">
                                <Image src={visualizeIcon} alt="" layout="cover"></Image>
                            </div>
                        </div>
                    </Item>
                </Grid>

                <Grid item xs={6}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'>
                            ANALYZE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-3/12">
                                <Image src={analyzeIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                </Grid>

            </Grid>
        </>
    )
}
