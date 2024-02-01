import GenesetSelect, { AugmentLayout } from "@/components/augment/SelectGeneset";
import ColorToggleButton from "@/components/misc/SectionToggle";
import prisma from "@/lib/prisma";
import { TextField, Typography } from "@mui/material";
import Container from "@mui/material/Container";

export default async function AugmentPage({ params }: { params: { id: string } }) {
    const sessionInfo = await prisma.pipelineSession.findUnique({
        where: {
            id: params.id
        },
        select: {
            gene_sets: {
                include: {
                    genes: true
                }
            }
        }
    })
    return (
        <Container>
            <ColorToggleButton sessionId={params.id} />
            <Container>
                <Typography variant="h3" color="secondary.dark" className='p-5'>AUGMENT YOUR GENE SETS</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
                    Augment your gene sets with co-expressed and co-mentioned genes
                </Typography>
                    <AugmentLayout sessionGenesets={sessionInfo} sessionId={params.id}/>
            </Container>
        </Container>
    )
}