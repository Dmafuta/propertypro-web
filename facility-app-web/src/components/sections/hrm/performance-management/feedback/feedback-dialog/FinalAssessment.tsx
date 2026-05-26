import { useFormContext } from 'react-hook-form';
import { filledInputClasses } from '@mui/material/FilledInput';
import { formHelperTextClasses } from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';
import { ReportFormValues } from './ReportFormDialog';

type FinalAssessmentProps = {
  sx?: SxProps<Theme>;
  assessment?: string;
};

const FinalAssessment = ({ assessment, sx }: FinalAssessmentProps) => {
  const methods = useFormContext<ReportFormValues>();
  return (
    <Stack sx={{ gap: 1, ...sx }}>
      <Typography sx={{ fontWeight: 700 }}>Final Assessment</Typography>
      {assessment ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {assessment}
        </Typography>
      ) : (
        <TextField
          multiline
          fullWidth
          rows={2}
          placeholder="Add Comment"
          helperText={
            <>
              <IconifyIcon icon="material-symbols:info-outline-rounded" sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                Type your comment and press Enter to add it.
              </Typography>
            </>
          }
          sx={{
            [`& .${filledInputClasses.root}`]: { py: 1 },
            [`& .${formHelperTextClasses.root}`]: {
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            },
          }}
          {...methods?.register('finalAssessment')}
        />
      )}
    </Stack>
  );
};

export default FinalAssessment;
