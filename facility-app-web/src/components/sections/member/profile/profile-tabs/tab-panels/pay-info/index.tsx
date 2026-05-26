import { Divider, Stack } from '@mui/material';
import { payInfoData } from 'data/member/profile';
import PanelWrapper from '../PanelWrapper';
import MonthlyPayroll from './MonthlyPayroll';
import PayHistory from './PayHistory';

interface PayInfoTabPanelProps {
  data: typeof payInfoData;
}

export const PayInfoTabPanel = ({ data }: PayInfoTabPanelProps) => {
  return (
    <PanelWrapper title="Pay Info">
      <Stack divider={<Divider flexItem />}>
        <MonthlyPayroll data={data.monthlyPayroll} />
        <PayHistory data={data.history} />
      </Stack>
    </PanelWrapper>
  );
};
