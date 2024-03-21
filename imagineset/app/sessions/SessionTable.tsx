'use client'
import { Table, TableBody, TableFooter, TablePagination, TableRow  } from "@mui/material";
import React from "react";
import { SessionRow } from "./SessionRow";
import { GeneSet, PipelineSession} from "@prisma/client";

export default function SessionTable({sessions}: { sessions: (PipelineSession & { gene_sets: GeneSet[] })[]}){
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
        return sessions.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        )
    }, [page, rowsPerPage, sessions])

    return (
        <Table sx={{ p: 2 }}>
        <TableBody>
            {displayedRows.map((session) =>
                <SessionRow key={session.id} session={session} />
            )}
        </TableBody>
        <TableFooter>
            <TableRow>
                <TablePagination
                    component="div"
                    count={sessions.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </TableRow>
        </TableFooter>
    </Table>
    )
}