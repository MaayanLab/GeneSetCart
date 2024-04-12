"use client"

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Logo } from '../styled/Logo';
import { Typography } from '@mui/material';
import { ElevatedIconButton } from '../styled/Buttons';
import Image from 'next/image';
import g2sgLogo from "@/public/img/g2sg-logo-nbg.png"
import { usePathname } from 'next/navigation';


export default function AppTitle({ sessionId }: { sessionId: string }) {
    const pathname = usePathname() 
    if (( pathname === '/') || (pathname === '/use-cases') || (pathname === '/api-documentation') || (pathname === '/sessions')){
        return (
            <Button className='flex items-center space-x-3' href='/'>
            <div>
                <ElevatedIconButton
                    aria-label="menu"
                    sx={{ width: 35, height: 35 }}
                >
                    <Image style={{ padding: 2, objectFit: "contain" }} fill={true} alt="cfde-logo" src={g2sgLogo} />
                </ElevatedIconButton>
            </div>
            <div>
                <Typography variant='cfde' color={'secondary'}>{'Get-Gene-Set-Go'}</Typography>
            </div>
        </Button>
        )
    }
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            {/* <Logo  title="Get-Gene-Set-Go" color="secondary" /> */}
            <Button className='flex items-center space-x-3' onClick={handleClickOpen}>
                <div>
                    <ElevatedIconButton
                        aria-label="menu"
                        sx={{ width: 35, height: 35 }}
                    >
                        <Image style={{ padding: 2, objectFit: "contain" }} fill={true} alt="cfde-logo" src={g2sgLogo} />
                    </ElevatedIconButton>
                </div>
                <div>
                    <Typography variant='cfde' color={'secondary'}>{'Get-Gene-Set-Go'}</Typography>
                </div>
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Leave Session?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Would you like to leave this session to start a new one?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} href={`/assemble/${sessionId}`} color='secondary'>No, stay in session</Button>
                    <Button onClick={handleClose} href={`/`} color='secondary' autoFocus>
                        Yes, leave session
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}