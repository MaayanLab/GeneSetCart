'use client'
import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SingleUpload from '@/components/assemble/fileUpload/SingleUpload';
import MultipleUpload from '@/components/assemble/fileUpload/MultipleUpload';
import GeneshotSearch from '@/components/assemble/Pubmed';
import { DCCPage } from '@/components/assemble/DCCFetch/DCCUpload';


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

export default function VerticalTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{ flexGrow: 1, display: 'flex', minHeight: '70vh'}}
    >
    <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs"
        sx={{ borderRight: 1, borderColor: 'divider', alignSelf: 'center'}}
        indicatorColor='secondary'
        textColor='secondary'
    >
        <Tab label="Upload .txt" {...a11yProps(0)} sx={{}}/>
        <Tab label=" Upload .gmt" {...a11yProps(1)} />
        <Tab label="Search CFDE DCC Gene Sets" {...a11yProps(2)} />
        <Tab label="Search Gene Sets from Pubmed" {...a11yProps(3)} />
      </Tabs>
      <TabPanel value={value} index={0} >
        <SingleUpload />
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
    </Box>
  );
}