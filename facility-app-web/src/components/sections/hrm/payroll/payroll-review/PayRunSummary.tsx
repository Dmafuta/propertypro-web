import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { payRunSummary } from 'data/hrm/payroll/payroll-review';
import IconifyIcon from 'components/base/IconifyIcon';

type PayRunSummaryProps = {
  summary: typeof payRunSummary;
};

const PayRunSummary = ({ summary }: PayRunSummaryProps) => {
  return (
    <div>
      <Typography variant="h5" sx={{ mb: 4 }}>
        Pay Run Summary
      </Typography>
      <Paper background={1} sx={{ outline: 0, p: { xs: 2, sm: 3 }, borderRadius: 6 }}>
        <Stack
          direction={{ md: 'row' }}
          sx={{
            gap: { xs: 2, md: 4 },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexShrink: 0 }}>
            <Button
              variant="soft"
              shape="circle"
              size="large"
              sx={{ bgcolor: 'primary.lighter', flexShrink: 0 }}
            >
              <IconifyIcon
                icon="material-symbols:request-quote-outline-rounded"
                sx={{ fontSize: 24, color: 'primary.main' }}
              />
            </Button>
            <Stack
              direction="row"
              sx={{ gap: 0.25, alignItems: 'baseline', justifyContent: 'center' }}
            >
              <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
                {summary.payrollCost}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Payroll cost
              </Typography>
            </Stack>
          </Stack>

          <Grid
            container
            spacing={{ xs: 2, lg: 4, xl: 6 }}
            sx={{
              flexShrink: 0,
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            {summary.costDetails.map((item, index) => (
              <Grid key={index} size={{ xs: 6, sm: 3 }} sx={{ minWidth: 96 }}>
                <Stack
                  sx={{
                    gap: 0.5,
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    minHeight: { xs: 48, md: 'auto' },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 400,
                      textAlign: 'left',
                      textWrap: 'nowrap',
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{item.value}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>
    </div>
  );
};

export default PayRunSummary;
