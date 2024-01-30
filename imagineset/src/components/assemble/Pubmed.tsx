'use client'
import {
  Button, Container,
  Grid, TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";;
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import React from "react";
import { checkValidGenes } from "@/app/assemble/[id]/AssembleFunctions ";

export default function GeneshotSearch() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [foundGenes, setFoundGenes] = React.useState<string[]>([])
  const [validGenes, setValidGenes] = React.useState<string[]>([])

  React.useEffect(() => {
    checkValidGenes(foundGenes.toString().substring(1, foundGenes.toString().length).replaceAll(',', '\n')).then((response) => setValidGenes(response))
  }, [foundGenes])

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


  const handleSearch = React.useCallback((
    query: string
  ) => {
    fetch("https://maayanlab.cloud/geneshot/api/search",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ "rif": "generif", "term": query })
      })
      .then((response) => response.json()
        .then((data) => {
          const genes = Object.keys(data['gene_count'])
          setFoundGenes(genes)
          console.log(genes)
        }))
      .catch((res) => { console.log(res) })
  }, [])

  return (
    <Container>
      <Typography variant="h3" color="secondary.dark" className='p-5'>SEARCH GENE SETS FROM PUBMED</Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        Enter a search term to obtain all genes mentioned with that term in publications
      </Typography>
      <Grid container direction='row' sx={{ p: 2 }} display={isMobile ? 'block' : 'flex'} spacing={1}>
        <Grid direction='column' container item spacing={2} xs={isMobile ? 12 : 6} alignItems="center" justifyItems='center'>
          <Grid item>
            <TextField id="outlined-basic" required label="Gene Set Name" variant="outlined" name='name' />
          </Grid>
          <Grid item>
            <TextField
              id="outlined-basic"
              label="Description"
              variant="outlined"
              name='description'
              rows={4}
              multiline
              placeholder="Gene Set Description (optional)"

            />
          </Grid>
        </Grid>
        <Grid direction='column' item container spacing={2} alignItems="center" justifyItems='center' xs={isMobile ? 12 : 6}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              name='search'
              onKeyDown={(event) => { if (event.key === 'Enter') { handleSearch((event.target as HTMLFormElement).value) } }}
            />
          </Search>
          <Typography variant='body1' color='secondary' sx={{mt:2}}> {foundGenes.length} genes found</Typography>
          <Typography variant='body1' color='secondary'> {validGenes.length} valid genes found</Typography>
          <TextField
            id="standard-multiline-static"
            multiline
            rows={10}
            disabled
            value={validGenes.toString().substring(1, validGenes.toString().length).replaceAll(',', '\n')}
          />
          <Grid item>
            <Button variant='outlined' color="secondary">
              ADD TO SETS
            </Button>
          </Grid>
        </Grid>
      </Grid>

    </Container>
  )
}