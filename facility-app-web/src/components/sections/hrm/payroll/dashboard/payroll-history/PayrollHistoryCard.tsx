import Button from '@mui/material/Button';
import Chip, { ChipProps } from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PayrollHistory } from 'data/hrm/payroll/dashboard';
import dayjs from 'dayjs';

const getChipColor = (status: string): ChipProps['color'] => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'completed':
      return 'success';
  }
};
const PayrollHistoryCard = ({ start, end, status }: PayrollHistory) => {
  const startDate = dayjs(start).format('D MMM');
  const endDate = dayjs(end).format('D MMM');
  const year = dayjs(end).format('YYYY');

  return (
    <Paper background={1} sx={{ outline: 0, p: 2, borderRadius: 4, height: 1 }}>
      <Stack
        direction="row"
        sx={{ height: 1, gap: 1, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
            }}
          >
            Payroll for {startDate} - {endDate}, {year}
          </Typography>
          <Chip
            variant="soft"
            color={getChipColor(status)}
            label={status}
            sx={{ textTransform: 'capitalize' }}
          />
        </Stack>
        <Button
          size="small"
          variant={status !== 'completed' ? 'soft' : 'text'}
          sx={{ textWrap: 'nowrap' }}
        >
          {status === 'completed' ? 'View' : 'Run Payroll'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default PayrollHistoryCard;
