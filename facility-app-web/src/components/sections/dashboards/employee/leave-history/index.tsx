import { leaveHistoryDara } from 'data/member/dashboard';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import SectionWrapper from 'components/sections/dashboards/hiring/common/SectionWrapper';
import LeaveHistoryList from './LeaveHistoryList';

const LeaveHistory = () => {
  return (
    <SectionWrapper>
      <SectionHeader
        title="Leave History"
        subTitle="Here’s a record of all your past leave."
        actionComponent={<DashboardMenu />}
      />

      <LeaveHistoryList leaves={leaveHistoryDara} />
    </SectionWrapper>
  );
};

export default LeaveHistory;
