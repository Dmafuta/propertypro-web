import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { LeaveHistory } from 'data/member/dashboard';
import dayjs from 'dayjs';

interface LeaveHistoryListProps {
  leaves: LeaveHistory[];
}

const LeaveHistoryList = ({ leaves }: LeaveHistoryListProps) => {
  return (
    <Box sx={{ overflowY: 'scroll', maxHeight: 375 }}>
      <ColumnFlexBox>
        {leaves.map((leave) => (
          <History key={leave.id} leave={leave} />
        ))}
      </ColumnFlexBox>
    </Box>
  );
};

interface HistoryProps {
  leave: LeaveHistory;
}

const History = ({ leave }: HistoryProps) => {
  const isDateArray = Array.isArray(leave.date);

  return (
    <Paper
      background={1}
      key={leave.id}
      sx={{ outline: 0, px: 2, py: 1, borderRadius: 2, width: 1, height: 1 }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', width: 1 }}
      >
        <div>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25 }}>
            {formatLeaveDate(leave.date)}
          </Typography>
          <Typography
            variant="caption"
            component="p"
            sx={{ fontWeight: 500, color: 'text.disabled' }}
          >
            {leave.reason}
          </Typography>
        </div>

        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {isDateArray ? `${(leave.date as Date[]).length} days` : '1 day'}
        </Typography>
      </Stack>
    </Paper>
  );
};

const formatLeaveDate = (date: Date | [Date, Date]) => {
  if (Array.isArray(date)) {
    const [start, end] = date;

    const startDay = dayjs(start);
    const endDay = dayjs(end);

    if (startDay.year() === endDay.year())
      return `${startDay.format('D MMM')}-${endDay.format('D MMM')}, ${startDay.format('YYYY')}`;

    return `${startDay.format('D MMM, YYYY')} - ${endDay.format('D MMM, YYYY')}`;
  }

  return dayjs(date).format('D MMM, YYYY');
};

const ColumnFlexBox = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export default LeaveHistoryList;
