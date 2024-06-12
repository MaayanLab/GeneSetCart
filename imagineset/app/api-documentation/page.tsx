import { Typography, Grid } from "@mui/material";
import Container from "@mui/material/Container";
import Header from '@/components/header/Header';
import APISwagger from "./SwaggerUI";

export default async function DocumentationPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Grid item>
        <Header sessionId={params.id} />
      </Grid>
      <Container>
        <Typography variant="h3" color="secondary.dark" sx={{ mb: 2, mt: 2 }}>API DOCUMENTATION</Typography>
        <Typography variant="subtitle1" color="#666666" sx={{ mb: 3 }}>
        </Typography>
        <APISwagger />
      </Container>
    </>
  )
}