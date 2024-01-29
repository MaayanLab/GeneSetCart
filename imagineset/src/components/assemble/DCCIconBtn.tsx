import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import Image from 'next/image'
import LINCSImg from '@/public/img/DCCImg/LINCS.gif'
import glycoscienceImg from  '@/public/img/DCCImg/Glycoscience.png'
import metabolomicsImg from '@/public/img/DCCImg/Metabolomics.png'
import komp2Img from '@/public/img/DCCImg/KOMP2.png'
import exrnaimg from '@/public/img/DCCImg/exRNA.png'
import gteximg from '@/public/img/DCCImg/GTEx.png'
import hmpimg from '@/public/img/DCCImg/HMP.png'
import hubmapimg from '@/public/img/DCCImg/HuBMAP.png'
import idgimg from '@/public/img/DCCImg/IDG.png'
import kidsfirstimg from '@/public/img/DCCImg/Kids First.png'
import motrpacimg from '@/public/img/DCCImg/MoTrPAC.png'

const dccs: { [key: string]: string } = {  

}


type dccsInfoType = {
    shortName: string;
    longName: string;
    imgString: string
}

export const dccInfo: dccsInfoType[] = [
    {
        shortName: 'LINCS',
        longName: 'Library of Integrated Network-based Cellular Signatures',
        imgString: LINCSImg.src
    },
    {
        shortName: 'Metabolomics',
        longName: 'Metabolomics',
        imgString: metabolomicsImg.src
    },
    {
        shortName: 'Glycoscience',
        longName:  'Glycoscience',
        imgString: glycoscienceImg.src
    },
    {
        shortName: 'KOMP2',
        longName: 'Knockout Mouse Phenotyping Program',
        imgString: komp2Img.src
    },
    {
        shortName: 'GTEx',
        longName:'Genotype Tissue Expression',
        imgString: gteximg.src
    },
    {
        shortName: 'HuBMAP',
        longName: 'Human BioMolecular Atlas Program',
        imgString: hubmapimg.src
    },
    {
        shortName: 'IDG',
        longName: 'Illuminating the Druggable Genome',
        imgString: idgimg.src
    },
    {
        shortName: 'MoTrPAC',
        longName: 'Molecular Transducers of Physical Activity Consortium',
        imgString: motrpacimg.src
    },

]


const CustomCard = ({
    image,
    title,
    subtitle,
}: {
    image: string;
    title: string;
    subtitle: string;
}) => (
    <Card sx={{
        flexShrink: 0,
        height: '100%',
        width: '200px',
        margin: 1
    }} >
        <CardActionArea>
            <CardMedia
                sx={{ position: 'relative', height:'120px' }}
            >
                <Image
                    src={image}
                    layout='fill'
                    alt=""
                    style={{ padding: "10%", objectFit: "contain" }}
                />
            </CardMedia>
            <CardContent sx={{ backgroundColor: '#C9D2E9' }}>
                <Typography variant={"body2"}>{title}</Typography>
            </CardContent>
        </CardActionArea>
    </Card>
);

export const DCCIcons = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                overflowX: 'scroll',
                maxWidth: '50vw'
            }}>
            {dccInfo.map((dcc, i) => (
                <CustomCard image={dcc.imgString} title={dcc.shortName} subtitle={dcc.longName} />
            ))}
        </Box>

    )
}