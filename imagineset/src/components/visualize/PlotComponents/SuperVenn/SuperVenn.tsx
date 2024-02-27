
import { CircularProgress } from '@mui/material';
import { Gene, GeneSet } from '@prisma/client';
import dynamic from 'next/dynamic'
import React from 'react';
const ReactSupervenn = dynamic(() => import('react-supervenn'), { ssr: false })

const hyposet_url = 'https://hyposet.maayanlab.cloud'

export function SuperVenn({ selectedSets }: {
    selectedSets: ({
        alphabet: string;
        genes: Gene[];
    } & GeneSet)[] | undefined
}) {
    const [props, setProps] = React.useState({})
    const [loading, setLoading] = React.useState(false)

    const inputProps = {
        sets: selectedSets?.map((geneset) => geneset.genes.map((gene) => gene.id)),
        set_annotations: selectedSets?.map((geneset, i) => geneset.alphabet),
        widths_minmax_ratio: 0.1,
        rotate_col_annotations: true,
    }

    React.useEffect(() => {
        setLoading(true)
        fetch(`${hyposet_url}/api/supervenn`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(inputProps),
        }).then((res) => res.json()).then((jsonRes) => {setLoading(false); setProps(jsonRes)})
    }, [selectedSets])
console.log(props)
    return (
        <div className='flex w-full p-1 justify-center'>
        {loading && <CircularProgress color='secondary' />}
        {!loading && <ReactSupervenn
            sets={[]} set_annotations={[]} chunks={[]} composition_array={[]} effective_min_width_for_annotation={0} col_widths={[]} n_items={0} ycounts={[]} rotate_col_annotations={false} color_by={'row'} color_cycle={[]} alternating_background={false} {...props} />}
        </div>

    )
}