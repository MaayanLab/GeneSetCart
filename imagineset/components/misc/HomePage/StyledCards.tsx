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
import { beginNewSession } from "./HomePageFunc";
import Cookie from 'js-cookie'
import Link from "next/link";
import Image from "next/image";
export default async function StyledCard( { sessionId }: { sessionId: string | undefined } ) {

    const Item = styled(Paper)(() => ({
        // backgroundColor: '#cee1f5',
        padding: 8,
        textAlign: 'center',
        // color: 'black',
        minHeight: '12vw',
        minWidth: '3vw',
        border: 'solid 1px',
        borderRadius: 20, 
        borderColor: '#a7c4e4',
        boxShadow: '12px 12px 10px 1px rgb(167 196 228)'
    }));

    const startSession = (page: string) => {
        beginNewSession(page)
    }
    return (
            <Grid container spacing={4}>
                <Grid item xs={6} md={4}>
                    {sessionId ?
                    <Link href={`/assemble/${sessionId}`}>
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark' >
                            ASSEMBLE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12">
                                <Image src={assembleIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                    </Link> : 
                    <div onClick={() => startSession('assemble')}>
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark' >
                            ASSEMBLE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12">
                                <Image src={assembleIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                    </div>} 
                </Grid>

                <Grid item xs={6} md={4}>
                {sessionId ? <Link href={`/augment/${sessionId}`}>
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark'>
                            AUGMENT
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12">
                                <Image src={augmentIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                    </Link>:
                    <div onClick={() => startSession('augment')}>
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark'>
                            AUGMENT
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12">
                                <Image src={augmentIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                    </div>}
                </Grid>

                <Grid item xs={6} md={4}>
                    {sessionId ? <Link href={`/combine/${sessionId}`}>
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark'>
                            COMBINE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12">
                                <Image src={combineIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                    </Link> : 
                    <div onClick={() => startSession('combine')}>
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark'>
                            COMBINE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12">
                                <Image src={combineIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                    </div>}
                </Grid>

                <Grid item xs={6} md={6}>
                    {sessionId ? <Link href={`/visualize/${sessionId}`}> 
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark'>
                            VISUALIZE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12 md:w-3/12" >
                                <Image src={visualizeIcon} alt="" layout="cover"></Image>
                            </div>
                        </div>
                    </Item>
                    </Link> : <div onClick={() => startSession('visualize')}>
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark'>
                            VISUALIZE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12 md:w-3/12" >
                                <Image src={visualizeIcon} alt="" layout="cover"></Image>
                            </div>
                        </div>
                    </Item>
                    </div>}
                </Grid>

                <Grid item xs={12} md={6}>
                    {sessionId ? <Link href={`/analyze/${sessionId}`}> 
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark'>
                            ANALYZE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12 md:w-3/12">
                                <Image src={analyzeIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                    </Link> : <div onClick={() => startSession('analyze')}>
                    <Item elevation={3}>
                        <Typography sx={{ typography: { sm: 'h4', xs: 'body2', fontWeight: 600 } }} color='secondary.dark'>
                            ANALYZE
                        </Typography>
                        <div className="flex justify-center align-center mt-5">
                            <div className="flex w-5/12 md:w-3/12">
                                <Image src={analyzeIcon} alt="" layout="fit"></Image>
                            </div>
                        </div>
                    </Item>
                    </div>}
                </Grid>
            </Grid>
    )
}
