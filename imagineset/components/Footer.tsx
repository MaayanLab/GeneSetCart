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
import ccLogo from '@/public/img/otherLogos/cc_by_sa.png'
import IconButton from "@mui/material/IconButton"
import Email from "@/public/img/email.svg"
import { CFDELogo, Logo } from './styled/Logo';
import { Divider } from '@mui/material';


export default async function Footer() {
    return (
        <Paper sx={{ background: "#336699", color: "#FFF", padding: 2, paddingTop: 5, borderRadius: 0, paddingBottom: 5 }}>
            <Container maxWidth="lg">
                <Grid container justifyContent={"space-around"}>
                    <Grid item>
                        <Stack direction={"column"} spacing={2}>
                            <CFDELogo title="CFDE Workbench" href="/" color="inherit" />
                            <Divider sx={{ borderColor: "#FFF" }} />
                            <Link href="https://github.com/MaayanLab/GeneSetCart/">
                                <div className='flex items-center space-x-1'>
                                    <Icon path={mdiGithub} size={1} />
                                    <Typography variant='subtitle2' className='flex'>
                                        View Source Code
                                    </Typography>
                                </div>
                            </Link>
                            <Link href="https://github.com/MaayanLab/GeneSetCart/issues/new" target='_blank'>
                                <div className='flex items-center space-x-1'>
                                    <Icon path={mdiBugOutline} size={1} />
                                    <Typography variant='subtitle2' className='flex'>
                                        Report a bug
                                    </Typography>
                                </div>
                            </Link>
                            <Divider sx={{ borderColor: "#FFF" }} />
                            <Link href="mailto:help@cfde.cloud">
                                <div className='flex items-center space-x-1'>
                                    <IconButton color={"secondary"}>
                                        <Email />
                                    </IconButton>
                                    <Typography variant='subtitle2' className='flex'>
                                        Contact
                                    </Typography>
                                </div>
                            </Link>
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Stack spacing={2}>
                            <Typography variant='footer' className='flex'>
                                <b>Consortium</b>
                            </Typography>
                            <Link href="https://data.cfde.cloud" target='_blank'>
                                <Typography variant='footer' className='flex'>
                                    Data Portal
                                </Typography>
                            </Link>
                            <Link href="https://info.cfde.cloud" target='_blank'>
                                <Typography variant='footer' className='flex'>
                                    Information Portal
                                </Typography>
                            </Link>
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Stack spacing={2}>
                            <Link href="https://labs.icahn.mssm.edu/maayanlab/" target='_blank'><Image src={maayanLabLogo} alt="" width='100' height={'100'}></Image></Link>
                            <Link href={"https://creativecommons.org/licenses/by-sa/4.0/"} target='_blank'><Image src={ccLogo} alt="" width='100' height={'100'}/></Link>
                        </Stack>

                    </Grid>
                </Grid>
            </Container>
        </Paper>

    )
}
