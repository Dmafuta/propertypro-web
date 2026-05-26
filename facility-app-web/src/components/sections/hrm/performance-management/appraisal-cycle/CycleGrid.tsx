import Grid from '@mui/material/Grid';
import { AppraisalCycle } from 'data/hrm/performance-management';
import AppraisalCycleCard from './CycleCard';

type CycleGridProps = {
  cycles: AppraisalCycle[];
};

const AppraisalCycleGrid = ({ cycles }: CycleGridProps) => {
  return (
    <Grid container spacing={2}>
      {cycles.map((cycle) => (
        <Grid key={cycle.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <AppraisalCycleCard {...cycle} />
        </Grid>
      ))}
    </Grid>
  );
};

export default AppraisalCycleGrid;
