import { Fragment, useRef, useState } from 'react';
import { attendanceData } from 'data/member/dashboard';
import dayjs from 'dayjs';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import SectionWrapper from 'components/sections/dashboards/hiring/common/SectionWrapper';
import AttendanceCalendar, { AttendanceCalendarMethods } from './AttendanceCalendar';
import CalendarLegend from './CalendarLegend';

const Attendance = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const calendarRef = useRef<AttendanceCalendarMethods | null>(null);

  return (
    <SectionWrapper>
      <SectionHeader
        title="Attendance"
        subTitle="Monthly attendance summary"
        actionComponent={<DashboardMenu />}
      />
      <Fragment>
        <AttendanceCalendar
          ref={calendarRef}
          data={attendanceData}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
        <CalendarLegend />
      </Fragment>
    </SectionWrapper>
  );
};

export default Attendance;
