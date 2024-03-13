'use client';

import { Typography } from '@mui/material';
import Link from 'next/link';

export default function GMTHeader({ sessionId }: { sessionId: string }) {
  return <Link href={`/gmt-cross/${sessionId}`}>
    <Typography variant="nav">CFDE GMT CROSSING</Typography>
  </Link>
}

export function CurrentSession({ sessionId }: { sessionId: string }) {
  return <Link href={`/assemble/${sessionId}`}>
    <Typography variant="nav"> CURRENT SESSION </Typography>
  </Link>
}