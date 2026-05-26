'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { OnLeaveUser } from 'data/member/dashboard';

interface OnLeaveListProps {
  users: OnLeaveUser[];
}

const OnLeaveList = ({ users }: OnLeaveListProps) => {
  return (
    <Box sx={{ overflowY: 'scroll', maxHeight: 380 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {users.map((user) => (
          <UserOnLeave key={user.id} user={user} />
        ))}
      </Box>
    </Box>
  );
};

const UserOnLeave = ({ user }: { user: OnLeaveUser }) => {
  return (
    <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
      <Avatar src={user.avatar} sx={{ width: 32, height: 32, flexShrink: 0 }} />
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}
      >
        <div>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
            {user.name}
          </Typography>
          <Typography
            variant="caption"
            component="p"
            sx={{ fontWeight: 500, color: 'text.secondary', lineHeight: 1.5 }}
          >
            {user.designation}
          </Typography>
        </div>
        <Typography
          variant="caption"
          component="p"
          sx={{ fontWeight: 500, color: 'text.secondary', lineHeight: 1.5 }}
        >
          {user.empID}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default OnLeaveList;
