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
        padding: 8,
        textAlign: 'center',
        minHeight: '6vw',
        minWidth: '1vw',
        border: 'solid 0.2px',
        borderRadius: 20, 
        borderColor: '#a7c4e4',
        // boxShadow: '12px 12px 10px 1px rgb(167 196 228)'
    }));

    return (
            <Grid container spacing={2} sx={{justifyContent:'center', marginBottom: 3}}>
                <Grid item xs={2}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark' sx={{fontWeight: 600}}>
                            ASSEMBLE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-3/12">
                                <Image src={assembleIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                </Grid>

                <Grid item xs={2}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'  sx={{fontWeight: 600}}>
                            AUGMENT
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-3/12">
                                <Image src={augmentIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                </Grid>

                <Grid item xs={2}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'  sx={{fontWeight: 600}}>
                            COMBINE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-3/12">
                                <Image src={combineIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                </Grid>

                <Grid item xs={2}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'  sx={{fontWeight: 600}}>
                            VISUALIZE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-3/12">
                                <Image src={visualizeIcon} alt="" layout="cover"></Image>
                            </div>
                        </div>
                    </Item>
                </Grid>

                <Grid item xs={2}>
                    <Item elevation={3}>
                        <Typography variant='h4' color='secondary.dark'  sx={{fontWeight: 600}}>
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
    )
}
