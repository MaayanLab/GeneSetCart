'use client'
import { Container, Grid, Typography, Tooltip, Chip } from "@mui/material";;
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import * as React from 'react';
import EnrichrTable from "./EnrichrTable";
import { LibraryList } from "./LibraryList";
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


export type searchResultsType = {
  id: number,
  genesetName: string,
  libraryName: string
}

export function EnrichrPage() {
  const [searchResults, setSearchResults] = React.useState<searchResultsType[]>([])
  const [libraries, setLibraries] = React.useState<string[]>([])
  const [checked, setChecked] = React.useState<number[]>([]);
  const params = useParams<{ id: string }>()
  const [privateSession, setPrivateSession] = React.useState(false)

  React.useEffect(() => {
    getPrivateSession(params.id).then((response: boolean | null) => {
      if (response) {
        setPrivateSession(response)
      }
    })
  }, [])

  const rows = React.useMemo(() => {
    return searchResults.filter((result) => (libraries.filter((library, i) => checked
      .includes(i))
      .includes(result.libraryName)))
  },
    [searchResults, checked, libraries])

  const handleSearch = React.useCallback((
    query: string
  ) => {
    fetch('https://maayanlab.cloud/Enrichr/termmap?' + new URLSearchParams(`meta=${query}`))
      .then((response) => response.json()
        .then((data) => {
          let foundSets: searchResultsType[] = []
          let idCount = 0
          const termResults = data['terms']
          setLibraries(Object.keys(termResults));
          setChecked(Object.keys(termResults).slice(0, 2).map((library, i) => i))
          Object.keys(termResults).forEach((library) => {
            const libraryResults = termResults[library];
            libraryResults.map((geneset: string) => {
              foundSets.push({
                id: idCount,
                genesetName: geneset,
                libraryName: library
              });
              idCount += 1;
            })
          })
          setSearchResults(foundSets)
        }
        ))
  }, [])

  return (
    <Container>
      <div className='flex items-center'>
        <Typography variant="h3" color="secondary.dark" className='p-5'>SEARCH ENRICHR GENE SETS</Typography>
        <Tooltip title={`Current session is ${privateSession ? 'private' : 'public'}`}>
          <Chip label={privateSession ? 'Private' : 'Public'} variant="outlined" />
        </Tooltip>
      </div>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        Search for Enrichr gene sets related to a term.
      </Typography>
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
            <LibraryList libraries={libraries} checked={checked} setChecked={setChecked} genesetCount={searchResults.length} />
          </Grid>
          <Grid container item xs={9}>
            <EnrichrTable rows={rows} />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}