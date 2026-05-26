import { ChangeEvent, MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import SearchTextField from 'components/common/SearchTextField';

interface TopSectionProps extends StackProps {
  handleSearch: (_: ChangeEvent<HTMLInputElement>) => void;
  handleToggleFilterPanel: (_: MouseEvent<HTMLButtonElement>) => void;
}

const TopSection = ({ handleSearch, handleToggleFilterPanel, sx, ...rest }: TopSectionProps) => {
  const { up } = useBreakpoints();
  const upSm = up('sm');
  return (
    <Stack
      direction={{ md: 'row' }}
      {...rest}
      sx={{ gap: 2, justifyContent: 'space-between', ...sx }}
    >
      <Stack direction="row" sx={{ gap: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ typography: { xs: 'h6', md: 'h5' } }}>
          Earnings and Deductions
        </Typography>
        <Button variant="soft" color="neutral" sx={{ ml: 'auto' }}>
          Import
        </Button>
      </Stack>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        <SearchTextField
          placeholder="Search Employee"
          fullWidth
          onChange={handleSearch}
          sx={{ maxWidth: 250 }}
        />
        <Button
          shape={upSm ? undefined : 'square'}
          variant="soft"
          color="neutral"
          onClick={handleToggleFilterPanel}
          sx={{ ml: 'auto', gap: 0.5, flexShrink: 0 }}
        >
          <IconifyIcon
            icon="material-symbols:filter-alt-outline"
            sx={{ fontSize: 20, flexShrink: 0 }}
          />
          {upSm && <Box component="span">Filter</Box>}
        </Button>
      </Stack>
    </Stack>
  );
};

export default TopSection;
