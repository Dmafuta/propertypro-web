'use client';

import { Grid } from '@mui/material';
import Attendance from './attendance';
import DailyAttendance from './daily-attendance';
import EmployeeGreetings from './greeting';
import LeaveHistory from './leave-history';
import LeaveToday from './leave-today';
import TimeAtWork from './time-at-work';
import TimeOff from './time-off';
import ToDoLists from './to-do-lists';

const Employee = () => {
  return (
    <Grid container>
      <Grid size={12}>
        <EmployeeGreetings />
      </Grid>
      <Grid container size={12}>
        <Grid container size={{ xs: 12, xl: 3 }}>
          <Grid size={{ xs: 12, sm: 6, xl: 12 }}>
            <DailyAttendance />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 12 }}>
            <TimeOff />
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 5 }}>
          <TimeAtWork />
        </Grid>
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <ToDoLists />
        </Grid>
      </Grid>
      <Grid container size={12}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <Attendance />
        </Grid>
        <Grid container size={{ xs: 12, xl: 6 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LeaveToday />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LeaveHistory />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Employee;
