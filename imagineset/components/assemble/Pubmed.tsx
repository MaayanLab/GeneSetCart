'use client'
import {
  Button, Container,
  Grid, Stack, Switch, TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";;
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import React from "react";
import { addToSessionSets, checkInSession, checkValidGenes } from "@/app/assemble/[id]/AssembleFunctions ";
import { LinearIndeterminate } from "../misc/Loading";
import Status from "./Status";
import { useParams } from "next/navigation";
import { addStatus } from "./fileUpload/SingleUpload";
import cache from "@/lib/cache";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';


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
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
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
  const [geneRIF, setGeneRIF] = React.useState(true)
  React.useEffect(() => {
    checkValidGenes(foundGenes.toString().replaceAll(',', '\n')).then((response) => setValidGenes(response))
  }, [foundGenes])

  const handleSearch = React.useCallback((
    query: string
  ) => {
    setLoading(true)
    const rif = geneRIF ? 'generif' : 'autorif'
    const cachedResult: any = cache.get(query + '-' + rif);
    if (cachedResult === undefined) {
      fetch("https://maayanlab.cloud/geneshot/api/search",
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({ "rif": rif, "term": query })
        })
        .then((response) => response.json()
          .then((data) => {
            setLoading(false)
            const genes = Object.keys(data['gene_count'])
            const success = cache.set(query + '-' + rif, genes, 10000)
            setFoundGenes(genes)
          }))
        .catch((res) => { setLoading(false); console.log(res) })
    } else {
      setLoading(false)
      setFoundGenes(cachedResult ? cachedResult : [])
    }
  }, [geneRIF])
  return (
    <Container maxWidth={false} sx={{ width: '100%' }}>
      <Typography variant="h3" color="secondary.dark" className='p-5'>SEARCH GENE SETS FROM PUBMED</Typography>
      <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 3 }}>
        Enter a search term to obtain all genes mentioned with that term in publications according to GeneRIF or AutoRIF.
      </Typography>
      <Stack direction='column' width={'100%'} sx={{ ml: 3 }}>
        {loading ? <LinearIndeterminate /> : <></>}
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
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Tooltip title='AutoRIF automatically searches PubMed for the entered terms and returns lists of genes associated with the resulting publications. Genes are ranked by either the number of times that gene was associated with the terms (Count) or the Count divided by the number of times that gene is referenced in publications in general (Normalized Count).'>
            <HelpOutlineIcon color="secondary"/>
          </Tooltip>
          <Typography color={'purple'}>AutoRIF</Typography>
          <Switch
            color="secondary"
            checked={geneRIF}
            onChange={() => setGeneRIF(!geneRIF)}
            sx={{
              "&.MuiSwitch-root .MuiSwitch-switchBase": {
                color: "purple"
              },
            
              "&.MuiSwitch-root .Mui-checked": {
               color: "#336699"
              }
             }}
          />
          <Typography color={'secondary'} >GeneRIF</Typography>
          <Tooltip title='Search PubMed using the manually-collected GeneRIF gene-term associations.'>
            <HelpOutlineIcon color='secondary' />
          </Tooltip>
        </Stack>
      </Stack>
      <Grid container sx={{ p: 2 }} alignItems="center" justifyContent="center" display={isMobile ? 'block' : 'flex'} spacing={5} component={'form'}
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
              setStatus({ error: { selected: true, message: "Gene set already exists in this session!" } })
            } else {
              addToSessionSets(validGenes, sessionId, genesetName, description ? description : '', [], false)
                .then((result) => { setStatus({ success: true }) })
                .catch((err) => {
                  if (err.message === 'No valid genes in gene set') {
                    setStatus({ error: { selected: true, message: err.message } })
                  } else {
                    setStatus({ error: { selected: true, message: "Error in adding gene set!" } })
                  }
                })
            }
          })
        }
        }>
        <Grid direction='column' container item spacing={2} xs={isMobile ? 12 : 5} justifyItems='center'>
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
        <Grid direction='column' item container spacing={2} alignItems="center" justifyItems='center' xs={isMobile ? 12 : 5}>
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
            <Button variant='contained' color="tertiary" type='submit'>
              <AddShoppingCartIcon /> &nbsp;
              ADD TO CART
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