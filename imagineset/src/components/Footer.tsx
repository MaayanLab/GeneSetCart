import Link from 'next/link'
import Image from 'next/image';
import { mdiGithub, mdiBugOutline, mdiEmail } from '@mdi/js';
import Icon from '@mdi/react'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import maayanLabLogo from '@/public/img/otherLogos/maayanlabLogo.png'


export default async function Footer() {
    return (
        <Paper sx={{ background: "#336699", color: "#FFF", padding: 2, paddingTop: 5, borderRadius: 0, paddingBottom: 5}}>
            <Container maxWidth="lg">
                <Grid container justifyContent={"space-around"}>
                    <Grid item>
                        <Stack direction={"column"} spacing={2}>
                            <Link href="https://github.com/MaayanLab/ImaginesetV2/">
                                <div className='flex items-center space-x-1'>
                                    <Icon path={mdiGithub} size={1} />
                                    <Typography variant='subtitle2' className='flex'>
                                        View Source Code
                                    </Typography>
                                </div>
                            </Link>
                            <Link href="https://github.com/MaayanLab/ImaginesetV2/issues/new">
                                <div className='flex items-center space-x-1'>
                                    <Icon path={mdiBugOutline} size={1} />
                                    <Typography variant='subtitle2' className='flex'>
                                        Report a bug
                                    </Typography>
                                </div>
                            </Link>
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Contact</Typography>
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Stack spacing={2}>
                            <Image src={maayanLabLogo} alt="" width='100' height={'100'}></Image>
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Stack spacing={2}>
                            <Link href="/"><Typography variant="caption">Terms of Service</Typography></Link>
                            <Link href="/"><Typography variant="caption">Privacy Policy</Typography></Link>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Paper>

    )
}
