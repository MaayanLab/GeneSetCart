import Header from '@/components/Header'
import { StartButton } from '@/components/misc/HomePage/StartButton'
import StyledCard from '@/components/misc/HomePage/StyledCards'
import { Button, Container, Typography } from '@mui/material'
import Image from 'next/image'
export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <StyledCard />
        <div className='flex mt-5 justify-center'>
        <StartButton />
        </div>
      </div>
    </main>
  )
}

