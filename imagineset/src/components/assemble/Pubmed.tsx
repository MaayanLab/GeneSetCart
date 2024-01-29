'use client'
import {Button, Container, 
    Grid, TextField, 
    Typography } from "@mui/material";;
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';

export default function GeneshotSearch() {
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

    return (
        <Container>
        <Typography variant="h3" color="secondary.dark" className='p-5'>SEARCH GENE SETS FROM PUBMED</Typography>
        <Typography variant="subtitle1" color="#666666" sx={{ mb: 3, ml: 2 }}>
            Enter a search term to obtain all genes mentioned with that term in publications
        </Typography>
        <Grid direction='column' container spacing={2} sx={{m: 6}} alignItems="center">  
        <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
            <Typography variant='body1' color='secondary'> 0 genes found</Typography>
            <TextField
                id="standard-multiline-static"
                multiline
                rows={10}
                placeholder="Paste gene symbols here"
            />
        {/* <Grid container sx={{ mt: 1 }}> */}
            <Grid item>
                <Button variant='outlined' color="secondary">
                    ADD TO SETS
                </Button>
            </Grid>
        {/* </Grid> */}
    </Grid>
    </Container>
    )
}