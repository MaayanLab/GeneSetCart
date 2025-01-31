'use client'
import {Container, Grid,Typography, Tooltip, Chip
} from "@mui/material";;
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import * as React from 'react';
import { DCCList } from "./DCCOptionsList";
import { DCCIcons } from "./DCCIconBtn";
import CFDEDataTable from "./CFDEDataTable";
import { termSearch } from "./DCCFetchFunc";
import { Gene } from "@prisma/client";
import { LinearIndeterminate } from "@/components/misc/Loading";
import { getPrivateSession } from "../fileUpload/getSessionPrivate";
import { useParams } from "next/navigation";

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


export const genesetLibDCCMap: { [key: string]: string } = {
  'Glygen Glycosylated Proteins': 'GlyGen',
  'GTEx Tissue-Specific Aging Signatures': 'GTEx',
  'GTEx Tissue Gene Expression Profiles': 'GTEx',
  'IDG Drug Targets': 'IDG',
  'KOMP2 Mouse Phenotypes': 'KOMP2',
  'LINCS L1000 CMAP Chemical Pertubation Consensus Signatures': "LINCS",
  'LINCS L1000 CMAP CRISPR Knockout Consensus Signatures': "LINCS",
  'MoTrPAC Rat Endurance Exercise Training': 'MoTrPAC',
  'Metabolomics Gene-Metabolite Associations': 'Metabolomics',
  'Human BioMolecular Atlas Program Azimuth': 'HuBMAP'
}

const dccCheckedDisplay = Object.values(genesetLibDCCMap).filter((v, i, self) => i == self.indexOf(v))

export type searchResultsType = {
  id: number,
  dcc: string,
  genesetName: string,
  libraryName: string
  genes: Gene[]
}


export function DCCPage() {
  const [searchResults, setSearchResults] = React.useState<searchResultsType[]>([])
  const [checked, setChecked] = React.useState<number[]>(dccCheckedDisplay.map((dcc, i) => i));
  const [loading, setLoading] = React.useState(false);
  const params = useParams<{ id: string }>()
  const [privateSession, setPrivateSession] = React.useState(false)

  React.useEffect(() => {
      getPrivateSession(params.id).then((response: boolean | null) => {
          if (response) {
              setPrivateSession(response)
          }
      })
  }, [])

  const searchDCCs = React.useMemo(() => {
    return searchResults.map((result) => result.dcc).filter((v, i, self) => i == self.indexOf(v))
  }, [searchResults])

  const rows = React.useMemo(() => {
    return searchResults.filter((result) => (dccCheckedDisplay.filter((dccOption, i) => checked
      .includes(i))
      .includes(result.dcc)))
  },
    [searchResults, checked])


  const handleSearch = React.useCallback((
    query: string
  ) => {
    setLoading(true)
    termSearch(query)
      .then((data) => {
        setLoading(false)
        setSearchResults(data.map((row, i) => ({
          id: i,
          dcc: genesetLibDCCMap[row.library],
          genesetName: row.term,
          libraryName: row.library,
          genes: row.genes
        })))
      }
      )
  }, [])

  return (
    <Container>
            <div className='flex items-center'>
            <Typography variant="h3" color="secondary.dark" className='p-5'>SEARCH CFDE DCC GENE SETS</Typography>
        <Tooltip title={`Current session is ${privateSession ? 'private' : 'public'}`}>
          <Chip label={privateSession ? 'Private' : 'Public'} variant="outlined" />
        </Tooltip>
      </div>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        Search for Common Fund generated gene sets related to a term
      </Typography>
      <DCCIcons selected={dccCheckedDisplay.filter((dccOption, i) => checked.includes(i) && searchDCCs.includes(dccOption))} />
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
        {loading ?
        <Grid container item spacing={2} xs={12}>
        <Grid container item xs={3}>
          <DCCList dccs={searchDCCs} checked={checked} setChecked={setChecked} />
        </Grid>
          <Grid container item xs={9}>
            <LinearIndeterminate />
            <CFDEDataTable rows={[]} />
          </Grid>
      </Grid>
            :
        <Grid container item spacing={2} xs={12}>
          <Grid container item xs={3}>
            <DCCList dccs={searchDCCs} checked={checked} setChecked={setChecked} />
          </Grid>
            <Grid container item xs={9}>
              <CFDEDataTable rows={rows} />
            </Grid>
        </Grid>}
      </Grid>
    </Container>
  )
}