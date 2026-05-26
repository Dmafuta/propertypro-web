import { Stack } from '@mui/material';
import AverageRating from './AverageRating';
import OverRating from './OverRating';

const ScorecardSummary = () => {
  return (
    <Stack direction={{ xs: 'row', lg: 'column', xl: 'row' }} sx={{ gap: 3 }}>
      <AverageRating />
      <OverRating />
    </Stack>
  );
};

export default ScorecardSummary;
