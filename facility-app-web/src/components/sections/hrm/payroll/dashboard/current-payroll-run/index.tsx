import Paper from '@mui/material/Paper';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import PayrollCard from './PayrollCard';

const CurrentPayrollRun = () => {
  return (
    <Paper
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: { xs: 3, md: 5 }, height: 1 }}
    >
      <SectionHeader
        title="Current Payroll Run"
        subTitle="New payroll setup ready for processing"
        actionComponent={<DashboardMenu size="medium" />}
        sx={{ mb: 0 }}
      />
      <PayrollCard />
    </Paper>
  );
};

export default CurrentPayrollRun;
