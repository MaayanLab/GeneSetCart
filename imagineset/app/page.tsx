import Header from '@/components/header/Header'
import { StartButton } from '@/components/misc/HomePage/StartButton'
import StyledCard from '@/components/misc/HomePage/StyledCards'
import { Grid } from '@mui/material'


export default async function Home({ params }: { params: { id: string } }) {
  return (
    <>
      <Grid item>
        <Header sessionId={params.id} />
      </Grid>
      <main className="flex flex-col items-center justify-between p-24">
        <div>
          <StyledCard />
          <div className='flex mt-5 justify-center'>
            <StartButton />
          </div>
        </div>
      </main>
    </>
  )
}

