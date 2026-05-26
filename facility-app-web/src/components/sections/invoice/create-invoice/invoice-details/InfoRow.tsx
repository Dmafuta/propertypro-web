import { Stack, Typography } from '@mui/material';

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => {
  return (
    <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, textWrap: 'nowrap' }}>
        {label} :
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
        {value || ''}
      </Typography>
    </Stack>
  );
};

export default InfoRow;
