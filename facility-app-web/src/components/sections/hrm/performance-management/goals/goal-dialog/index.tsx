import Dialog, { DialogProps, dialogClasses } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Goal } from 'data/hrm/performance-management';
import DetailsSection from './DetailsSection';
import TitleSection from './TitleSection';
import CommentSection from './comments';

interface GoalDialogProps {
  goal: Goal;
  dialogProps: Omit<DialogProps, 'onClose'> & { onClose: () => void };
}

const GoalDialog = ({ goal, dialogProps }: GoalDialogProps) => {
  const { sx, onClose } = dialogProps;
  return (
    <Dialog
      {...dialogProps}
      scroll="body"
      maxWidth={false}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 6,
          overflow: 'visible',
          maxWidth: 600,
          ...sx,
        },
      }}
    >
      {/* Title */}
      <TitleSection goal={goal} onClose={onClose} />

      <DialogContent sx={{ p: { xs: 3, sm: 5 }, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Details */}
        <DetailsSection goal={goal} />

        {/* Comments */}
        <CommentSection />
      </DialogContent>
    </Dialog>
  );
};

export default GoalDialog;
