'use client'
import React from 'react'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'

import {usePathname} from 'next/navigation'

export default function NavBreadcrumbs() {
    const path = usePathname()
    const {path_split, format_path_split} = React.useMemo(() => {
        const path_split = path.replace("/", "").split("/")
        const format_path_split = path_split.map(p => decodeURIComponent(p).replace('_', ' '))
        return {path_split, format_path_split}
    }, [path])
    if (path_split.length < 2) return null
    return (
        <Breadcrumbs aria-label="breadcrumb" separator="›">
            {format_path_split.map((p,i)=>(
                <Link 
                    key={i}
                    href={`/${path_split.slice(0, i+1).join("/")}`}
                >
                    <Typography variant='caption' sx={{textTransform: 'uppercase'}} color={i===path_split.length-1 ? 'secondary': 'inherit'}>{p}</Typography>
                </Link>
            ))}
        </Breadcrumbs>
    )
}