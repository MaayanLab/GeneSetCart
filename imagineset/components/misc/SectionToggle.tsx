'use client'
import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography'
import { usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import { Button, Link, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function ColorToggleButton({ sessionId }: { sessionId: string }) {
    const pathname = usePathname()
    const [menuItem, setMenuItem] = React.useState((pathname !== null) ? pathname.split('/').slice(0, 2).join('/') : '');

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newItem: string,
    ) => {
        setMenuItem(newItem);
    };

    const inOneDay = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    Cookies.set('session_id', sessionId, { secure: true, expires: inOneDay, sameSite: 'None' })

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <ToggleButtonGroup
            color="secondary"
            value={menuItem}
            exclusive
            onChange={handleChange}
            aria-label="Platform"
            fullWidth
        >
            <ToggleButton value="/assemble" onClick={handleClick}>
                ASSEMBLE &nbsp; <ArrowDropDownIcon />
            </ToggleButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem component={Link} href={`/assemble/${sessionId}?type=single`}>Upload .txt</MenuItem>
                <MenuItem component={Link} href={`/assemble/${sessionId}?type=multiple`}>Upload .xmt</MenuItem>
                <MenuItem component={Link} href={`/assemble/${sessionId}?type=cfde`}>Search CFDE DCC gene sets</MenuItem>
                <MenuItem component={Link} href={`/assemble/${sessionId}?type=pubmed`}>Search gene sets from PubMed </MenuItem>
                <MenuItem component={Link} href={`/assemble/${sessionId}?type=enrichr`}>Search Enrichr gene sets </MenuItem>
            </Menu>
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
            <ToggleButton value="/report" href={`/report/${sessionId}`}>
                <Typography variant="nav" align='center'>GENERATE REPORT</Typography>
            </ToggleButton>
        </ToggleButtonGroup>

    );
}