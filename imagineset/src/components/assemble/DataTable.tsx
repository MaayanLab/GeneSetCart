import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 50 },
  { field: 'Gene set name', headerName: 'Gene set name', width: 200 },
  { field: 'Genes', headerName: 'Genes', width: 150 },
  {
    field: 'Description',
    headerName: 'Description',
    width: 200,
  }
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
];

export default function DataTable() {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{
          '.MuiDataGrid-columnHeader': {
            backgroundColor: '#C9D2E9',
          },
        }}
      />
    </div>
  );
}