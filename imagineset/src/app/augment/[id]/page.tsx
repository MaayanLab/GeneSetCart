import ColorToggleButton from "@/components/misc/SectionToggle";
import Container from "@mui/material/Container";

export default async function AugmentPage({ params }: { params: { id: string } }){
    return (
        <Container>
        <ColorToggleButton sessionId={params.id}/>
        </Container>
    )
}