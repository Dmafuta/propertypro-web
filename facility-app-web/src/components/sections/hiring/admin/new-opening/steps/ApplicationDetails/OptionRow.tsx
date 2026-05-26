import { ControllerRenderProps } from 'react-hook-form';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
import { ApplicationDetailsFormValues } from '.';

const OptionRow = ({
  field,
  label,
  sx,
}: {
  field: ControllerRenderProps<ApplicationDetailsFormValues>;
  label: string;
  sx?: SxProps<Theme>;
}) => {
  return (
    <Stack
      component={RadioGroup}
      direction="row"
      {...field}
      sx={[
        {
          gap: 1,
          px: { xs: 1, sm: 3 },
          py: 1,
          height: 64,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        sx={{
          justifyContent: 'center',
          flexGrow: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          flexBasis: { xs: '17.5%', sm: '20%' },
          textAlign: 'center',
        }}
      >
        <FormControlLabel value="required" control={<Radio />} label="" sx={{ mr: 0 }} />
      </Stack>
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          flexBasis: { xs: '17.5%', sm: '20%' },
          textAlign: 'center',
        }}
      >
        <FormControlLabel value="optional" control={<Radio />} label="" sx={{ mr: 0 }} />
      </Stack>
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          flexBasis: { xs: '17.5%', sm: '20%' },
          textAlign: 'center',
        }}
      >
        <FormControlLabel value="disabled" control={<Radio />} label="" sx={{ mr: 0 }} />
      </Stack>
    </Stack>
  );
};

export default OptionRow;
