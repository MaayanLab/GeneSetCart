'use client';

import { Typography } from '@mui/material';
import Link from 'next/link';
import { TextNav } from './client';

export default function GMTHeader({ sessionId }: { sessionId: string }) {
  return <Link href={`/gmt-cross/${sessionId}`}>
     <TextNav title={"CFDE GMT CROSSING"} path={`/gmt-cross/${sessionId}`} />
  </Link>
}

export function CurrentSession({ sessionId }: { sessionId: string }) {
  return <Link href={`/assemble/${sessionId}`}>
    <Typography variant="nav"> CURRENT SESSION </Typography>
  </Link>
}