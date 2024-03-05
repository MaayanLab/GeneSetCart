'use client'
import {
  Box,
  Button, Container,
  Grid, LinearProgress, TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";;
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import React from "react";
import { addToSessionSets, checkInSession, checkValidGenes } from "@/app/assemble/[id]/AssembleFunctions ";
import CircularIndeterminate from "../misc/Loading";
import Status from "./Status";
import { stat } from "fs";
import { useParams } from "next/navigation";
import { addStatus } from "./fileUpload/SingleUpload";
import { Just_Another_Hand } from "next/font/google";

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
    // transition: theme.transitions.create('width'),
    // [theme.breakpoints.up('sm')]: {
    //   width: '12ch',
    // },
  },
}));



export default function GeneshotSearch() {
  const theme = useTheme();
  const params = useParams<{ id: string }>()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [foundGenes, setFoundGenes] = React.useState<string[]>([])
  const [validGenes, setValidGenes] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState<addStatus>({})
  React.useEffect(() => {
    checkValidGenes(foundGenes.toString().replaceAll(',', '\n')).then((response) => setValidGenes(response))
  }, [foundGenes])

  const handleSearch = React.useCallback((
    query: string
  ) => {
    setLoading(true)
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
          setLoading(false)
          const genes = Object.keys(data['gene_count'])
          setFoundGenes(genes)
        }))
      .catch((res) => { setLoading(false); console.log(res) })
  }, [])

  console.log(loading)
  return (
    <Container>
      <Typography variant="h3" color="secondary.dark" className='p-5'>SEARCH GENE SETS FROM PUBMED</Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
        Enter a search term to obtain all genes mentioned with that term in publications
      </Typography>
      {/* container sx={{ p: 2 }} display={isMobile ? 'block' : 'flex'} spacing={1} alignItems="center" justifyContent="center" component={'form'} */}
      <Grid container sx={{ p: 2 }} alignItems="center" justifyContent="center" display={isMobile ? 'block' : 'flex'} spacing={1} component={'form'}
        onSubmit={(evt) => {
          evt.preventDefault();
          const formData = new FormData(evt.currentTarget)
          const genesetName = formData.get('name')?.toString()
          let description = formData.get('description')?.toString()
          if (!genesetName) throw new Error('no gene set name')
          if (!description) description = ''
          const sessionId = params.id
          checkInSession(sessionId, genesetName).then((response) => {
            if (response) {
                setStatus({error:{selected:true, message:"Gene set already exists in this session!"}})
            } else {
                addToSessionSets(validGenes, sessionId, genesetName, description ? description : '').then((result) => {setStatus({success:true})}).catch((err) => setStatus({error:{selected:true, message:"Error adding gene set!"}}))
            }
        })   
        }
        }>
        <Grid item direction='row' container alignItems="center" justifyItems='center'>
          <Grid item sx={{justifyItems:'center'}}>
            {loading ? <CircularIndeterminate /> : <></>}
          </Grid>
          <Grid item  xs={12}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                name='search'
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch((event.target as HTMLFormElement).value)
                  }
                }}
              />
            </Search>
          </Grid>
        </Grid>
        <Grid direction='column' container item spacing={2} xs={isMobile ? 12 : 6} justifyItems='center'>

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
          <Typography variant='body1' color='secondary' sx={{ mt: 2 }}> {foundGenes.length} genes</Typography>
          <Typography variant='body1' color='secondary'> {validGenes.length} valid genes found</Typography>
          <TextField
            id="standard-multiline-static"
            multiline
            rows={10}
            disabled
            value={validGenes.toString().substring(1, validGenes.toString().length).replaceAll(',', '\n')}
          />
          <Grid item>
            <Button variant='outlined' color="secondary" type='submit'>
              ADD TO SETS
            </Button>
          </Grid>
          <Grid item>
            <Status status={status} />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}