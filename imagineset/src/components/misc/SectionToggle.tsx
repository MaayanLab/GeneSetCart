'use client'
import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography'
import { usePathname } from 'next/navigation'
import { Container } from '@mui/material';

export default function ColorToggleButton({sessionId}: {sessionId: string}) {
    const pathname = usePathname()
    const [menuItem, setMenuItem] = React.useState(pathname.split('/').slice(0, 2).join('/'));
    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newItem: string,
    ) => {
        setMenuItem(newItem);
    };

    return (
        <ToggleButtonGroup
            color="secondary"
            value={menuItem.split('/').slice(0, 2).join('/')}
            exclusive
            onChange={handleChange}
            aria-label="Platform"
            fullWidth
        >
            <ToggleButton value="/assemble" href={`/assemble/${sessionId}`}>
                <Typography variant="nav" align='center'>ASSEMBLE</Typography>
            </ToggleButton>
            <ToggleButton value="/augment" href={`/augment/${sessionId}`}>
                <Typography variant="nav" align='center'>AUGMENT</Typography>
            </ToggleButton>
            <ToggleButton value="/combine" href={`/combine/${sessionId}`}>
                <Typography variant="nav" align='center'>COMBINE</Typography>
            </ToggleButton>
            <ToggleButton value="/visualize" href={`/visualize/${sessionId}`}>
                <Typography variant="nav" align='center'>VISUALIZE</Typography>
            </ToggleButton>
            <ToggleButton value="/analyze" href={`/analyze/${sessionId}`}>
                <Typography variant="nav" align='center'>ANALYZE</Typography>
            </ToggleButton>
        </ToggleButtonGroup>

    );
}