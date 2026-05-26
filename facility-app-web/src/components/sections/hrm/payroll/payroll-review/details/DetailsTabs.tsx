import { SyntheticEvent } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

interface DetailsTabsProps {
  value: 'employee' | 'tax';
  onChange: (event: SyntheticEvent, value: 'employee' | 'tax') => void;
  sx?: BoxProps['sx'];
}

const DetailsTabs = ({ value, onChange, sx }: DetailsTabsProps) => {
  return (
    <Box sx={{ ...sx }}>
      <Tabs value={value} onChange={onChange} aria-label="payroll details tabs">
        <Tab label="Employee Summary" value="employee" />
        <Tab label="Tax Summary" value="tax" />
      </Tabs>
    </Box>
  );
};

export default DetailsTabs;
