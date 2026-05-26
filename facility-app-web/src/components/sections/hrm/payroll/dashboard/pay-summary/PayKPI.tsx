import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PayKPI as PayKPIType } from 'data/hrm/payroll/dashboard';
import IconifyIcon from 'components/base/IconifyIcon';

const PayKPI = ({ title, value, icon }: PayKPIType) => {
  return (
    <Paper background={1} sx={{ outline: 0, p: 2, borderRadius: 4, height: 1 }}>
      <Stack sx={{ height: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
            borderRadius: 6,
            bgcolor: 'chBlue.50',
          }}
        >
          <IconifyIcon icon={icon as string} sx={{ fontSize: 24, color: 'chBlue.600' }} />
        </Stack>

        <Stack sx={{ gap: 2, alignItems: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: 'chBlue.600',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
            }}
          >
            {value}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default PayKPI;
