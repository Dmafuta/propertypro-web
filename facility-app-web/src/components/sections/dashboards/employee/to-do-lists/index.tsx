'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { toDoListsData } from 'data/member/dashboard';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import SectionWrapper from 'components/sections/dashboards/hiring/common/SectionWrapper';
import ToDoListItem from './ToDoListItem';

const ToDoLists = () => {
  return (
    <SectionWrapper>
      <SectionHeader
        title="To Do Lists"
        subTitle="Check out your task list right here."
        actionComponent={<DashboardMenu />}
      />
      <Box sx={{ overflowY: 'scroll', maxHeight: 400 }}>
        <Stack sx={{ gap: 1 }}>
          {toDoListsData.map((todo, index) => (
            <ToDoListItem key={index} item={todo} />
          ))}
        </Stack>
      </Box>
    </SectionWrapper>
  );
};

export default ToDoLists;
