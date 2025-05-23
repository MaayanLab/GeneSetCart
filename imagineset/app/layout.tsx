import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import './globals.css'
import ThemeRegistry from './ThemeRegistry';
import Background from '@/components/styled/background'
import { Grid } from '@mui/material/'
import Footer from '@/components/Footer';
import { GoogleAnalytics } from '@next/third-parties/google'


// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GeneSetCart',
  description: '',
  icons: {
    icon: '/img/G2SG-logo.png', // /public path
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body>
        <ThemeRegistry options={{ key: 'mui' }}>
          <Grid container direction={"column"} justifyContent="space-between" sx={{ minHeight: "100vh", marginTop: 2 }}>
            <Grid item className="flex grow">
              <Background background="#E7F3F5">
                {children}
              </Background>
            </Grid>
            <Grid item><Footer /></Grid>
          </Grid>
        </ThemeRegistry>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} /> : null}
      </body>
    </html>
  )
}
