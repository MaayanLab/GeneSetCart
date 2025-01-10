import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { overlapArray } from './fetchData';

export default function BasicTable({ rows }: { rows: overlapArray[] }) {
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Set 1</TableCell>
                        <TableCell align="center">Set 2</TableCell>
                        <TableCell align="center">nOverlap</TableCell>
                        <TableCell align="center">Genes</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, i) => {
                        if (row.overlapGenes.length === 0) {
                            return null
                        }
                        return (
                        <TableRow
                            key={i}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="center">{row.geneset1 + ` (${row.geneset1N})`}</TableCell>
                            <TableCell align="center">{row.geneset2 + ` (${row.geneset2N})`}</TableCell>
                            <TableCell align="center">{row.overlapGenes.length}</TableCell>
                            <TableCell align="center">{row.overlapGenes.join(', ')}</TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
