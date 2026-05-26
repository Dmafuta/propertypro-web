'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { ToDoList } from 'data/member/dashboard';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';

interface ToDoListItemProps {
  item: ToDoList;
}

const ToDoListItem = ({ item }: ToDoListItemProps) => {
  return (
    <Paper background={1} sx={{ p: 1, borderRadius: 2, outline: 0 }}>
      <Stack direction="row" sx={{ gap: 1, justifyContent: 'space-between' }}>
        <Stack direction="row" sx={{ gap: 2, flexGrow: 1, alignItems: 'flex-start' }}>
          <Stack
            direction="row"
            sx={({ vars }) => ({
              p: 1.5,
              borderRadius: 2,
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${vars.palette[item.icon.color].lighter}`,
            })}
          >
            <IconifyIcon
              icon={item.icon.src}
              sx={({ vars }) => ({ fontSize: 24, color: `${vars.palette[item.icon.color].dark}` })}
            />
          </Stack>
          {item.content}
        </Stack>
        <DashboardMenu size="medium" sx={{ flexShrink: 0 }} />
      </Stack>
    </Paper>
  );
};

export default ToDoListItem;
