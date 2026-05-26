import { Avatar, Stack, Typography } from '@mui/material';
import { jobData } from 'data/member/profile';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';

interface TeamMembersProps {
  members: (typeof jobData)['teamMembers'];
}

const TeamMembers = ({ members }: TeamMembersProps) => {
  return (
    <Stack sx={{ gap: 0.5 }}>
      {members.map((member) => (
        <Stack key={member.id} direction="row" sx={{ gap: 2, py: 2, alignItems: 'center' }}>
          <Avatar src={member.avatar} sx={{ width: 48, height: 48 }} />
          <Stack sx={{ gap: 0.5, flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {member.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
              {member.designation}
            </Typography>
          </Stack>

          <DashboardMenu
            size="medium"
            icon={<IconifyIcon icon="material-symbols:more-vert" />}
            sx={{ fontSize: 20 }}
          />
        </Stack>
      ))}
    </Stack>
  );
};

export default TeamMembers;
