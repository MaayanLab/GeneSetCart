'use client';

import { Typography } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function GMTHeader() {
  const currentPage = usePathname();
  if (currentPage.split('/').length === 3){
    const sessionId = currentPage.split('/')[2]
    return   <Link href={`/gmt-cross/${sessionId}`}>
    <Typography variant="nav">CFDE GMT CROSSING</Typography>
  </Link> 
  } else {
    return   <></>
  }
}