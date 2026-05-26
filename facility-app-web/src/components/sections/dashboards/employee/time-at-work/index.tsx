import { Fragment } from 'react/jsx-runtime';
import { timeAtWorkData } from 'data/member/dashboard';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import SectionWrapper from 'components/sections/dashboards/hiring/common/SectionWrapper';
import TimeAtWorkKPI from './TimeAtWorkKPI';
import WeeklyFrequency from './WeeklyFrequency';

const TimeAtWork = () => {
  return (
    <SectionWrapper sx={{ display: 'flex', flexDirection: 'column' }}>
      <SectionHeader
        title="Time at Work"
        subTitle="Attendance Summary of this week"
        actionComponent={<DashboardMenu />}
      />
      <Fragment>
        <TimeAtWorkKPI />
        <WeeklyFrequency days={timeAtWorkData} />
      </Fragment>
    </SectionWrapper>
  );
};

export default TimeAtWork;
