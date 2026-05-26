import dayjs from 'dayjs';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import SectionWrapper from 'components/sections/dashboards/hiring/common/SectionWrapper';
import AttendanceCounter from './AttendanceCounter';

const DailyAttendance = () => {
  return (
    <SectionWrapper>
      <SectionHeader
        title="Daily Attendance"
        subTitle={`Today's attendance, ${dayjs().format('MMM DD')}.`}
        actionComponent={<DashboardMenu />}
      />
      <AttendanceCounter />
    </SectionWrapper>
  );
};

export default DailyAttendance;
