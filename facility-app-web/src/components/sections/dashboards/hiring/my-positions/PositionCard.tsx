'use client';

import Avatar from '@mui/material/Avatar';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { type Position } from 'types/hiring';
import DashboardMenu from 'components/common/DashboardMenu';

const PositionCard = ({ item }: { item: Position }) => {
  return (
    <Paper
      background={1}
      sx={{
        p: 3,
        outline: 0,
        borderRadius: 6,
        '&:hover': { bgcolor: 'background.elevation2', cursor: 'pointer' },
      }}
    >
      <Stack sx={{ gap: 3 }}>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Stack sx={{ gap: 0.5, flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
              }}
            >
              {item.title}
            </Typography>
            <Stack direction="row" sx={{ gap: 1 }}>
              <Typography
                component="span"
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              >
                {item.field}
              </Typography>
              <Typography
                component="span"
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {item.location}
              </Typography>
            </Stack>
          </Stack>

          <DashboardMenu />
        </Stack>

        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
          }}
        >
          <AvatarGroup
            max={5}
            sx={{
              [`& .${avatarGroupClasses.avatar}`]: {
                width: 24,
                height: 24,
                fontSize: 10,
              },
            }}
          >
            {item.users.map((user) => (
              <Avatar key={user.id} src={user.avatar} sx={{ width: 24, height: 24 }} />
            ))}
          </AvatarGroup>

          <Chip label={item.status.text} color={item.status.color} />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default PositionCard;
