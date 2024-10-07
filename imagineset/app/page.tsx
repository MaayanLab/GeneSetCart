import Header from '@/components/header/Header'
import { StartButton } from '@/components/misc/HomePage/StartButton'
import StyledCard from '@/components/misc/HomePage/StyledCards'
import { Grid } from '@mui/material'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PipelineSession, User } from '@prisma/client'
import Cookies from 'js-cookie'

export default async function Home({ params }: { params: { id: string } }) {
  let sessionId = Cookies.get('session_id')
  const session = await getServerSession(authOptions);
  if (!sessionId) {
    sessionId = cookies().get("session_id")?.value;
  }
  if (session && !sessionId) {
    // if logged in but has no cookie, get most recently modified session
    const sessionsRanked = await prisma.pipelineSession.findMany({
      where: {
        user_id: session.user.id,
      },
      orderBy: {
        lastModified: "desc",
      },
    });
    if (sessionsRanked.length > 0) {
      const mostRecentSessionId = sessionsRanked[0].id;
      sessionId = mostRecentSessionId;
    }
  }
  if (sessionId) {
    let user: (User & { pipelineSessions: PipelineSession[] }) | null;
    if (session) {
      user = await prisma.user.findFirst({
        where: {
          id: session.user.id,
        },
        include: {
          pipelineSessions: true,
        },
      });
    } else {
      user = await prisma.user.findFirst({
        where: {
          id: process.env.PUBLIC_USER_ID,
        },
        include: {
          pipelineSessions: true,
        },
      });
    }
    const userSessionArray = user?.pipelineSessions.map(
      (sessionObject) => sessionObject.id
    );
    if (userSessionArray?.includes(sessionId)) {
      const inOneDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      Cookies.set("session_id", sessionId, {
        secure: true,
        expires: inOneDay,
        sameSite: "None",
      });
      const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
          id: sessionId,
        },
        select: {
          gene_sets: {
            include: {
              genes: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          id: true,
          session_name: true,
        },
      });
      sessionId = sessionInfo?.id
    }
  }
  return (
    <>
      <Grid item>
        <Header sessionId={sessionId} />
      </Grid>
      <main className="flex flex-col items-center justify-between p-24">
        <div>
          <StyledCard sessionId={sessionId} />
          <div className='flex mt-5 justify-center'>
            <StartButton />
          </div>
        </div>
      </main>
    </>
  )
}

