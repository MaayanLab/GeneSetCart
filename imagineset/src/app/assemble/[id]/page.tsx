import ColorToggleButton from "@/components/misc/SectionToggle";
import VerticalTabs from "./AssembleOptions";
import Container from "@mui/material/Container";

export default async function AssemblePage({ params }: { params: { id: string } }){
    return (
        <Container sx={{mb:4}}>
        <ColorToggleButton sessionId={params.id}/>
        <VerticalTabs />
        </Container>
    )
}