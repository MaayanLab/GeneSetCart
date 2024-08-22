'use client'
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Gene, GeneSet } from '@prisma/client';
import { Typography, Container, Grid, TableFooter, TablePagination } from "@mui/material";
import { DeleteBtn, SplitButton, ViewGenesBtn } from "@/app/analyze/[id]/ViewGenesBtn";

export default function PaginatedTable({ rows }: {
    rows: ({
        genes: Gene[];
    } & GeneSet)[]
}) {

    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };


    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const displayedRows = React.useMemo(()=> {
        return rows.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        )
    }, [page, rowsPerPage, rows])
    return (
        <TableContainer component={Paper} sx={{ml:3}}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center">Gene Set</TableCell>
                        <TableCell align="center">Description</TableCell>
                        <TableCell align="center">Genes</TableCell>
                        <TableCell align="center">Analysis Links</TableCell>
                        <TableCell align="center"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {displayedRows.map((row) => (
                        <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                <Grid container direction='column'>
                                    <Grid item sx={{wordBreak: 'break-word'}}>
                                        {row.name}
                                    </Grid>
                                    <Grid item>
                                        <Typography sx={{ fontSize: 12, color: 'gray' }}>
                                            {'Added: ' + row.createdAt.toUTCString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell align="right">{row.description}</TableCell>
                            <TableCell align="right"><ViewGenesBtn row={row} /></TableCell>
                            <TableCell align="right"><SplitButton row={row} /></TableCell>
                            <TableCell align="right"><DeleteBtn row={row}/></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                        <TablePagination
                            component="div"
                            count={rows.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        />
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    )
}