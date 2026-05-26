import { Fragment } from 'react/jsx-runtime';
import { timeOffData } from 'data/member/dashboard';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import SectionWrapper from 'components/sections/dashboards/hiring/common/SectionWrapper';
import ApplyLeaveDialog from './ApplyLeaveDialog';
import LeavesRemaining from './LeavesRemaining';

const TimeOff = () => {
  return (
    <SectionWrapper>
      <SectionHeader
        title="Time off"
        subTitle="Apply for leave & view available days."
        actionComponent={<DashboardMenu />}
      />
      <Fragment>
        <LeavesRemaining leaves={timeOffData} />
        <ApplyLeaveDialog />
      </Fragment>
    </SectionWrapper>
  );
};

export default TimeOff;
