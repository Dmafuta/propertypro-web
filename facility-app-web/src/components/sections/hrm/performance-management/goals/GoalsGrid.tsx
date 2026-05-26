import Grid, { GridProps } from '@mui/material/Grid';
import { Goal } from 'data/hrm/performance-management';
import GoalCard from './GoalCard';

interface GoalsGridProps extends GridProps {
  goals: Goal[];
}

const GoalsGrid = ({ goals, ...rest }: GoalsGridProps) => {
  return (
    <Grid container spacing={2} {...rest}>
      {goals.map((goal) => (
        <Grid key={goal.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <GoalCard goal={goal} />
        </Grid>
      ))}
    </Grid>
  );
};

export default GoalsGrid;
