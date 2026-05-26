'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LeaveLeft } from 'data/member/dashboard';

interface LeavesRemainingProps {
  leaves: LeaveLeft[];
}

const LeavesRemaining = ({ leaves }: LeavesRemainingProps) => {
  return (
    <Stack direction="row" sx={{ gap: 1, overflowX: 'scroll', mb: 2 }}>
      {leaves.map((leave) => (
        <Paper
          key={leave.id}
          background={2}
          sx={{
            p: 1,
            borderRadius: 1,
            outline: 0,
          }}
        >
          <Stack sx={{ gap: 0.25 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600 }}
            >{`${leave.left}/${leave.total}`}</Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', textWrap: 'nowrap' }}>
            {leave.leaveType}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
};

export default LeavesRemaining;
