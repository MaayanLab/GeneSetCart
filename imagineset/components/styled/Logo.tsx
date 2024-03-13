import Link from 'next/link';
import Image from 'next/image';
import Typography from '@mui/material/Typography'
import { ElevatedIconButton } from "./Buttons";

import cfdeLogo from "@/public/img/favicon.png"
import g2sgLogo from "@/public/img/g2sg-logo-nbg.png"

export const Logo = ({href, title, color}: {href: string, title: string, color: "primary"| "secondary" | "inherit"}) => (
    <Link href={href} className='flex items-center space-x-3'>
        <div>
        <ElevatedIconButton
            aria-label="menu"
            sx={{width: 35, height: 35}}
        >
            <Image style={{padding: 2,  objectFit: "contain"}} fill={true} alt="cfde-logo" src={g2sgLogo} />
        </ElevatedIconButton>
        </div>
        <div>
            <Typography variant='cfde' color={color}>{title}</Typography>
        </div>
    </Link>
)