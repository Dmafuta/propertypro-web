'use client';

import { Stack } from '@mui/material';
import { TaskMetrics } from 'types/project';
import TaskSummaryCard from './TaskSummaryCard';

interface TaskSummaryProps {
  taskMetrics: TaskMetrics[];
}
const TaskSummary = ({ taskMetrics }: TaskSummaryProps) => {
  return (
    <Stack direction={{ sm: 'row' }} sx={{ flex: 1 }}>
      {taskMetrics.map((task) => (
        <TaskSummaryCard key={task.title} task={task} />
      ))}
    </Stack>
  );
};

export default TaskSummary;
