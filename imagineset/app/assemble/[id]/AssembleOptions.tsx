'use client'
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import SingleUpload from '@/components/assemble/fileUpload/SingleUpload';
import MultipleUpload from '@/components/assemble/fileUpload/MultipleUpload';
import GeneshotSearch from '@/components/assemble/Pubmed';
import { DCCPage } from '@/components/assemble/DCCFetch/DCCUpload';
import { AppBar, Grid } from '@mui/material';
import { EnrichrPage } from '@/components/assemble/Enrichr/EnrichrLayout';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const tabIndexMapping : {[key: string]: number} = {
  'single': 0,
  'multiple': 1,
  'cfde': 2, 
  'pubmed': 3,
  'enrichr': 4
}

export default function VerticalTabs({queryParams}: {queryParams: Record<string, string | string[] | undefined>}) {
  const [value, setValue] = React.useState(typeof(queryParams['type']) === 'string' ? tabIndexMapping[queryParams['type']]: 0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Grid container direction='row' sx={{ minHeight: '70vh', maxWidth: '100%' }}>
      <Grid item container xs={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
      <AppBar position="static" sx={{border: 0.5, borderRadius: 1,  borderColor: 'divider'}}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs"
          sx={{ borderRight: 1, borderColor: 'divider', alignSelf: 'center' }}
          indicatorColor='secondary'
          textColor='secondary'
        >
          <Tab label="Upload .txt" {...a11yProps(0)} sx={{borderBottom: 1, borderColor: 'divider'}} />
          <Tab label=" Upload .xmt" {...a11yProps(1)} sx={{borderBottom: 1, borderColor: 'divider'}}/>
          <Tab label="Search CFDE DCC Gene Sets" {...a11yProps(2)} sx={{borderBottom: 1, borderColor: 'divider'}}/>
          <Tab label="Search Gene Sets from Pubmed" {...a11yProps(3)} sx={{borderBottom: 1, borderColor: 'divider'}}/>
          <Tab label="Search Enrichr Gene Sets" {...a11yProps(4)} />
        </Tabs>
        </AppBar>
      </Grid>
      <Grid item container xs={10}>
        <TabPanel value={value} index={0} >
          <SingleUpload queryParams={queryParams}/>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <MultipleUpload />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <DCCPage />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <GeneshotSearch />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <EnrichrPage />
        </TabPanel>
      </Grid>
    </Grid>
  );
}