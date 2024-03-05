import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import './globals.css'
import ThemeRegistry from './ThemeRegistry';
import Background from '@/components/styled/background'
import NavBreadcrumbs from '@/components/breadcrumbs'
import { Grid } from '@mui/material/'
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Get-Gene-Set-Go',
  description: '',
  icons: {
    icon: '/img/favicon.png', // /public path
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
          <Grid item>
            <Header />
            </Grid>
            <Grid item className="flex grow">
              <Background background="#E7F3F5">
                {children}
              </Background>
            </Grid>
            <Grid item><Footer/></Grid>  
          </Grid>
        </ThemeRegistry>
      </body>
    </html>
  )
}
