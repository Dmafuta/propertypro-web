import { ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface DealInfoItemProps {
  attribute: string;
  value: string | ReactNode;
  background: boolean;
}

const DealInfoItem = ({ attribute, value, background = false }: DealInfoItemProps) => {
  return (
    <Stack
      sx={[
        { gap: 1, p: 2, borderRadius: 1, alignItems: 'flex-start' },
        background && { bgcolor: 'background.elevation1' },
      ]}
    >
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
        {attribute}:
      </Typography>
      {value}
    </Stack>
  );
};

export default DealInfoItem;
