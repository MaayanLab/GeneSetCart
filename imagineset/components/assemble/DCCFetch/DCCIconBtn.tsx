import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import { Box } from "@mui/material";
import Image from 'next/image'
import LINCSImg from '@/public/img/DCCImg/LINCS.gif'
import glygenImg from  '@/public/img/DCCImg/glygen.png'
import metabolomicsImg from '@/public/img/DCCImg/Metabolomics.png'
import komp2Img from '@/public/img/DCCImg/KOMP2.png'
import gteximg from '@/public/img/DCCImg/GTEx.png'
import idgimg from '@/public/img/DCCImg/IDG.png'
import motrpacimg from '@/public/img/DCCImg/MoTrPAC.png'


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
        shortName: 'GlyGen',
        longName:  'GlyGen',
        imgString: glygenImg.src
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
        width: '90px',
        margin: 1
    }} >
        <CardActionArea>
            <CardMedia
                sx={{ position: 'relative', height:'90px' }}
            >
                <Image
                    src={image}
                    fill
                    alt=""
                    style={{ padding: "10%", objectFit: "contain" }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </CardMedia>
        </CardActionArea>
    </Card>
);

export const DCCIcons = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                overflowX: 'scroll',
                justifyContent: 'center'
                // maxWidth: '50vw'
            }}>
            {dccInfo.map((dcc, i) => (
                <CustomCard key={dcc.shortName} image={dcc.imgString} title={dcc.shortName} subtitle={dcc.longName} />
            ))}
        </Box>

    )
}