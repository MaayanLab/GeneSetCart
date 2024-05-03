"use client"

import * as React from 'react';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import { ElevatedIconButton } from '../styled/Buttons';
import Image from 'next/image';
import g2sgLogo from "@/public/img/g2sg-logo-nbg.png"
import { Gene } from '@prisma/client';


export default function AppTitle() {

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
