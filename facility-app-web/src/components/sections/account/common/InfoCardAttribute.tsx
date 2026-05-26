import { Stack, Typography } from '@mui/material';

interface InfoCardAttributeProps {
  label: string;
  value: string;
}

const InfoCardAttribute = ({ label, value }: InfoCardAttributeProps) => {
  return (
    <Stack direction={{ sm: 'row' }} sx={{ gap: 1 }}>
      <Typography variant="subtitle2" sx={{ minWidth: 120, fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 400, overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  );
};

export default InfoCardAttribute;
