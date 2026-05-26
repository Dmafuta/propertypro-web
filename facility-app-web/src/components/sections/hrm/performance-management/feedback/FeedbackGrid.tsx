import Grid from '@mui/material/Grid';
import { Feedback } from 'data/hrm/performance-management';
import FeedbackCard from './FeedbackCard';

interface FeedbackGridProps {
  feedbacks: Feedback[];
}

const FeedbackGrid = ({ feedbacks }: FeedbackGridProps) => {
  return (
    <Grid container spacing={2}>
      {feedbacks.map((feedback) => (
        <Grid key={feedback.id} size={{ xs: 12, sm: 6 }}>
          <FeedbackCard feedback={feedback} />
        </Grid>
      ))}
    </Grid>
  );
};

export default FeedbackGrid;
