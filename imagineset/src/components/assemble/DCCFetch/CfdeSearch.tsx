'use client'
import {
  Box, Button, Container,
  FormControl, Grid, InputLabel,
  MenuItem, Select, Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, TextField,
  Typography, useMediaQuery,
  useTheme
} from "@mui/material";;
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import * as React from 'react';
import { DCCList } from "./DCCOptionsList";
import { DCCIcons } from "./DCCIconBtn";

import { addToSessionSets, checkValidGenes } from "@/app/assemble/[id]/AssembleFunctions ";
import { AddGenesetButton, GenesetDialogBox } from "./RowGeneset";


const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  border: '1px solid'
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));


const DCCGenesetOptions = ["LINCS_L1000_Chem_Pert_Consensus_Sigs", "LINCS_L1000_CRISPR_KO_Consensus_Sigs", "GTEx_Tissues_V8_2023",
  "GTEx_Aging_Signatures_2021", "Metabolomics_Workbench_Metabolites_2022", "IDG_Drug_Targets_2022",
  "GlyGen_Glycosylated_Proteins_2022", "KOMP2_Mouse_Phenotypes_2022", "HuBMAP_ASCTplusB_augmented_2022", "MoTrPAC_2023"]

export const genesetLibDCCMap: { [key: string]: string } = {
  "LINCS_L1000_Chem_Pert_Consensus_Sigs": "LINCS",
  "LINCS_L1000_CRISPR_KO_Consensus_Sigs": 'LINCS',
  "GTEx_Tissues_V8_2023": 'GTEx',
  "GTEx_Aging_Signatures_2021": 'GTEx',
  "Metabolomics_Workbench_Metabolites_2022": 'Metabolomics',
  "IDG_Drug_Targets_2022": 'IDG',
  "GlyGen_Glycosylated_Proteins_2022": 'Glycoscience',
  "KOMP2_Mouse_Phenotypes_2022": 'KOMP2',
  "HuBMAP_ASCTplusB_augmented_2022": 'HuBMAP',
  "MoTrPAC_2023": 'MoTrPAC'
}
export type searchResultsType = {
  dcc: string,
  genesetName: string,
  libraryName: string
  genes: string[]
}
export default function CFDEFetch() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchResults, setSearchResults] = React.useState<searchResultsType[]>([])

  const handleChangePage = React.useCallback((
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  }, [page]);

  const handleChangeRowsPerPage = React.useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, [page]);

  const handleSearch = React.useCallback((
    query: string
  ) => {
    fetch('https://maayanlab.cloud/Enrichr/termmap?' + new URLSearchParams(`meta=${query}`))
      .then((response) => response.json()
        .then((data) => {
          const cfdeLibs = Object.keys(data['terms'])
            .filter((key) => DCCGenesetOptions.includes(key))
            .reduce((obj, key) => {
              return Object.assign(obj, {
                [key]: data['terms'][key]
              });
            }, {}) as { [key: string]: [] };
          const newTableRows = Object.keys(cfdeLibs).map((lib) => {
            const libSets = cfdeLibs[lib]
            return libSets.map((geneset) => {
              return {
                dcc: genesetLibDCCMap[lib],
                libraryName: lib,
                genesetName: geneset,
                genes: []
              }
            })
          })
          setSearchResults(newTableRows.flat())
        }
        ))
  }, [])


  return (
    <Container>
      <Typography variant="h3" color="secondary.dark" className='p-5'>SEARCH CFDE DCC GENE SETS</Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        Search for Common Fund generated gene sets related to a term
      </Typography>
      <DCCIcons />
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid container item xs={12} justifyContent={'right'}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              name='search'
              onKeyDown={(event) => { if (event.key === 'Enter') { handleSearch((event.target as HTMLFormElement).value) } }}
              fullWidth
            />
          </Search>
        </Grid>
        <Grid container item spacing={2} xs={12}>
          <Grid container item xs={3}>
            <DCCList />
          </Grid>
          <Grid container item xs={9}>
            <Table sx={{ minWidth: '100%' }}>
              <TableHead sx={{ maxHeight: 5 }}>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>DCC</TableCell>
                  <TableCell>Gene Set Name</TableCell>
                  <TableCell align="right">Genes</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage,
                ).map((resultItem, i) =>
                  <TableRow
                    key={i}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                    <AddGenesetButton resultItem={resultItem}/>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {resultItem.dcc}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {resultItem.genesetName}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <GenesetDialogBox resultItem={resultItem} />
                    </TableCell>
                  </TableRow>)}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                    colSpan={8}
                    count={searchResults.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}