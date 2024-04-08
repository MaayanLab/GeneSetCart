import { Typography, Grid } from "@mui/material";
import Container from "@mui/material/Container";
import Header from '@/components/header/Header';

export default async function DocumentationPage({ params }: { params: { id: string } }) {
    return (
        <>
        <Grid item>
            <Header sessionId={params.id}/>
        </Grid>
        <Container>
            <Typography variant="h3" color="secondary.dark" className='p-5'>API DOCUMENTATION</Typography>
            <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
            </Typography>
        </Container>
        </>
    )
}