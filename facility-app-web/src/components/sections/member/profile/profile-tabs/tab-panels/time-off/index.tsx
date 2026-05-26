import { Divider, Grid, Stack } from '@mui/material';
import { timeOffData } from 'data/member/profile';
import PanelWrapper from '../PanelWrapper';
import AppliedLeave from './AppliedLeave';
import BasicInfo from './BasicInfo';
import History from './History';

interface TimeOffTabPanelProps {
  data: typeof timeOffData;
}

export const TimeOffTabPanel = ({ data }: TimeOffTabPanelProps) => {
  return (
    <PanelWrapper title="Time Off">
      <Stack divider={<Divider flexItem />}>
        <Grid container columns={20} spacing={5} sx={{ pb: 3 }}>
          <Grid size={{ xs: 20, sm: 8 }}>
            <BasicInfo data={data.basicInfo.chart} />
          </Grid>
          <Grid size={{ xs: 20, sm: 12 }}>
            <AppliedLeave data={data.basicInfo.appliedLeave} />
          </Grid>
        </Grid>

        <History data={data.history} />
      </Stack>
    </PanelWrapper>
  );
};
