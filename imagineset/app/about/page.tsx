import ColorToggleButton from "@/components/misc/SectionToggle";
import { Typography, Grid } from "@mui/material";
import Container from "@mui/material/Container";
import Header from '@/components/header/Header';


export default function About({ params }: { params: { id: string } }) {
    return (
        <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>ABOUT G2SG</Typography>
                <Typography className="text-center" variant="h2">COMING SOON...</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                </Typography>
            </Container>
        </>
    )
}