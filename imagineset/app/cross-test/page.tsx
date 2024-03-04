'use client'
import { Button, Stack, TextField } from "@mui/material"
import React from "react"
import { generateHypothesis, generateHypothesis2 } from "./hypothesis"

export default function CrossTest() {
    const [hypothesis, setHypothesis] = React.useState('')
    return (
        <Stack direction='column'>
            <Stack direction='column' component='form' onSubmit={(evt) => {
                evt.preventDefault()
                const formData = new FormData(evt.currentTarget)
                const abstract1 = formData.get('abstract1')?.toString()
                const abstract2 = formData.get('abstract2')?.toString()
                const term1 = formData.get('term2')?.toString()
                const term2 = formData.get('term1')?.toString()
                const overlap = formData.get('overlap')?.toString()
                const overlapList = overlap ? overlap.split('\n') : []
                if (!term1 || !term2) throw new Error("missing terms")
                generateHypothesis2(term1, term2, overlapList, abstract1 ? abstract1 : '',  abstract2 ? abstract2 : '').then((result:any) => setHypothesis(result.toString())).catch((err) => setHypothesis('Error in using OpenAI API. Try again later.'))
            }}>
                <TextField
                    name='term1'
                >
                </TextField>
                <TextField
                    name='term2'
                >
                </TextField>
                <TextField
                    multiline
                    rows={10}
                    name='abstract1'
                >
                </TextField>
                <TextField
                    multiline
                    rows={10}
                    name='abstract2'
                >
                </TextField>
                <TextField
                    multiline
                    rows={10}
                    name='overlap'
                >
                </TextField>
                <Button type="submit">
                    Generate
                </Button>
            </Stack>
            <TextField
                multiline
                rows={10}
                value={hypothesis}
            >
            </TextField>
        </Stack>



    )
}