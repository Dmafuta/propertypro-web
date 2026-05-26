import { leaveTodayData } from 'data/member/dashboard';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import SectionWrapper from 'components/sections/dashboards/hiring/common/SectionWrapper';
import OnLeaveList from './OnLeaveList';

const LeaveToday = () => {
  return (
    <SectionWrapper>
      <SectionHeader
        title="Leave Today"
        subTitle="Check who else is on leave today."
        actionComponent={<DashboardMenu />}
      />
      <OnLeaveList users={leaveTodayData} />
    </SectionWrapper>
  );
};

export default LeaveToday;
