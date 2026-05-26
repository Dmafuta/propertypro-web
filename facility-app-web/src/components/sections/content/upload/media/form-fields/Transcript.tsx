import { Controller, useFormContext } from 'react-hook-form';
import { inputBaseClasses } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { UploadMediaValues } from 'components/sections/content/views/UploadMedia';
import StyledTextField from 'components/styled/StyledTextField';

const Transcript = () => {
  const {
    formState: { errors },
    register,
    control,
  } = useFormContext<UploadMediaValues>();

  return (
    <div>
      <Stack
        direction="row"
        sx={{ gap: 1, mb: 1, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
          }}
        >
          Subtitle/Transcript
        </Typography>
        <Controller
          control={control}
          name="transcript.autoGenerate"
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch size="small" checked={field.value} {...field} />}
              label="Auto-generate"
              sx={{ gap: 1, mx: 0, flexDirection: 'row-reverse' }}
            />
          )}
        />
      </Stack>
      <StyledTextField
        fullWidth
        multiline
        rows={8}
        placeholder="Add Subtitle"
        error={!!errors.transcript?.subtitle}
        helperText={errors.transcript?.subtitle?.message as string}
        {...register('transcript.subtitle')}
        sx={{
          [`& .${inputBaseClasses.root}`]: {
            pt: 0,
          },
        }}
      />
    </div>
  );
};

export default Transcript;
