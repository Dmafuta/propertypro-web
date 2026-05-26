import { ChangeEvent } from 'react';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

interface PricingHeaderProps {
  isYearly: boolean;
  handleSwitchChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onButtonChange?: (value: boolean) => void;
  displayMode: 'column' | 'table';
}

const PricingHeader = ({
  isYearly,
  handleSwitchChange,
  onButtonChange,
  displayMode,
}: PricingHeaderProps) => {
  const renderPricingSwitch = (
    <Stack direction="row" sx={{ gap: 1, alignSelf: { xs: 'flex-start', lg: 'flex-end' } }}>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
        }}
      >
        Monthly pricing
      </Typography>
      <Switch checked={isYearly} onChange={handleSwitchChange} />
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
        }}
      >
        Annual pricing
      </Typography>
    </Stack>
  );

  const renderPricingButtons = (
    <Stack direction="row" sx={{ gap: { xs: 1, sm: 2 }, alignSelf: 'flex-end', width: 1 }}>
      <Button
        fullWidth
        variant="soft"
        size="large"
        color={isYearly ? 'primary' : 'neutral'}
        onClick={() => onButtonChange?.(true)}
      >
        Yearly
      </Button>{' '}
      <Button
        fullWidth
        variant="soft"
        size="large"
        color={!isYearly ? 'primary' : 'neutral'}
        onClick={() => onButtonChange?.(false)}
      >
        Monthly
      </Button>
    </Stack>
  );

  return (
    <Stack
      direction={{ lg: displayMode === 'column' ? 'row' : 'column' }}
      sx={{
        px: { xs: 3, md: 5 },
        pt: { xs: 3, md: 5 },
        pb: 5,
        justifyContent: 'space-between',
        rowGap: { xs: 3, lg: 6 },
        columnGap: { xs: 3, lg: 0 },
      }}
    >
      <Box sx={{ maxWidth: 510 }}>
        <Stack
          direction={{ sm: 'row' }}
          sx={{ gap: 2, mb: 3, alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Typography variant="h4">Pricing Options</Typography>
          <Chip label="Free for 30 days" variant="soft" color="warning" />
        </Stack>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            mb: 1,
          }}
        >
          Get the power, control, and customization you need to manage your team’s and
          organization’s projects.
        </Typography>

        <Link href="#!">Have questions? Chat with us</Link>
      </Box>
      {displayMode === 'column' ? renderPricingSwitch : renderPricingButtons}
    </Stack>
  );
};

export default PricingHeader;
