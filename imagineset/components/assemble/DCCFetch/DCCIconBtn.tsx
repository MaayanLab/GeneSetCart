import React from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import { Box, Grid, Stack } from "@mui/material";
import Image from 'next/image'
import LINCSImg from '@/public/img/DCCImg/LINCS-logo.png'
import glygenImg from '@/public/img/DCCImg/glygen.png'
import metabolomicsImg from '@/public/img/DCCImg/Metabolomics.png'
import komp2Img from '@/public/img/DCCImg/KOMP2.png'
import gteximg from '@/public/img/DCCImg/GTEx.png'
import idgimg from '@/public/img/DCCImg/IDG.png'
import motrpacimg from '@/public/img/DCCImg/motrpac_logo_copy.png'
import hubmapimg from '@/public/img/DCCImg/HuBMAP.png'

type dccsInfoType = {
    shortName: string;
    longName: string;
    imgString: string
}

export const dccInfo: dccsInfoType[] = [
    {
        shortName: 'Metabolomics',
        longName: 'Metabolomics',
        imgString: metabolomicsImg.src
    },
    {
        shortName: 'GlyGen',
        longName: 'GlyGen',
        imgString: glygenImg.src
    },
    {
        shortName: 'LINCS',
        longName: 'Library of Integrated Network-based Cellular Signatures',
        imgString: LINCSImg.src
    },
    {
        shortName: 'KOMP2',
        longName: 'Knockout Mouse Phenotyping Program',
        imgString: komp2Img.src
    },
    {
        shortName: 'GTEx',
        longName: 'Genotype Tissue Expression',
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
    {
        shortName: 'HuBMAP',
        longName: 'The Human BioMolecular Atlas Program',
        imgString: hubmapimg.src
    },

]


const CustomCard = ({
    image,
    title,
    subtitle,
    selected,
}: {
    image: string;
    title: string;
    subtitle: string;
    selected: string[];
    
}) => (
    <Card sx={{
        flexShrink: 0,
        height: '100px',
        // width: '120px',
        width: `calc(80% / ${8})`,
        margin: 1,
        backgroundColor: selected.includes(title) ? 'lightblue' : 'white'
    }} >
        <CardActionArea>
            <CardMedia
                sx={{ position: 'relative', height: '90px' }}
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

export const DCCIcons = ({ selected }: { selected: string[] }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
            }}>
            <Stack direction='row' useFlexGap flexWrap="wrap" spacing={0.5} width={'100%'}>
                {dccInfo.map((dcc, i) => (
                    <CustomCard key={dcc.shortName} image={dcc.imgString} title={dcc.shortName} subtitle={dcc.longName} selected={selected} />
                ))}
            </Stack>
        </Box>

    )
}