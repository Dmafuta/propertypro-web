import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { users } from 'data/users';
import { PaletteColorKey } from 'types/theme';
import { User } from 'types/users';

export type LeaveLeft = {
  id: number;
  leaveType: string;
  left: number;
  total: number;
};

export const timeOffData: LeaveLeft[] = [
  { id: 1, leaveType: 'Paid Leave', left: 3, total: 4 },
  { id: 2, leaveType: 'Casual Leave', left: 3, total: 4 },
  { id: 3, leaveType: 'Sick Leave', left: 3, total: 4 },
  { id: 4, leaveType: 'Public Holidays', left: 3, total: 4 },
  { id: 5, leaveType: 'Maternity Leave', left: 10, total: 12 },
  { id: 6, leaveType: 'Bereavement Leave', left: 2, total: 3 },
];

export type WeeklyDayHour = {
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  value: number;
};

export const timeAtWorkData: WeeklyDayHour[] = [
  { day: 'Sunday', value: 61 },
  { day: 'Monday', value: 61 },
  { day: 'Tuesday', value: 89.78 },
  { day: 'Wednesday', value: 71 },
  { day: 'Thursday', value: 80 },
  { day: 'Friday', value: 89.43 },
  { day: 'Saturday', value: 68.55 },
];

export type ToDoList = {
  icon: { src: string; color: PaletteColorKey };
  content: ReactNode;
};

export const toDoListsData: ToDoList[] = [
  {
    icon: { src: 'material-symbols:group-outline', color: 'primary' },
    content: (
      <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          <Box component="strong" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Albus Dumbldore
          </Box>
          {` `}requested a meeting
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          in 1 month
        </Typography>
      </Stack>
    ),
  },
  {
    icon: { src: 'material-symbols:draw-outline-rounded', color: 'success' },
    content: (
      <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          <Box component="strong" sx={{ fontWeight: 700, color: 'text.primary' }}>
            w-8ben
          </Box>
          {` `}is waiting for your signature
        </Typography>
        <Chip color="warning" label="Due" />
      </Stack>
    ),
  },
  {
    icon: { src: 'material-symbols:group-outline', color: 'primary' },
    content: (
      <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          <Box component="strong" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Albus Dumbldore
          </Box>
          {` `}requested a meeting
        </Typography>
        <Chip color="neutral" label="Cancelled" />
      </Stack>
    ),
  },
  {
    icon: { src: 'material-symbols:draw-outline-rounded', color: 'success' },
    content: (
      <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Redrafted Benefit Form
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          of Jacob Kowalski is waiting for your signature
        </Typography>
        <Chip color="warning" label="Due" />
      </Stack>
    ),
  },
  {
    icon: { src: 'material-symbols:reviews-outline-rounded', color: 'primary' },
    content: (
      <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Performance review
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          of Arthur Weasley in is ready for you
        </Typography>
        <Chip color="warning" label="Due" />
      </Stack>
    ),
  },
  {
    icon: { src: 'material-symbols:assignment-outline-rounded', color: 'warning' },
    content: (
      <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Onboarding checklist
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          of Hermione Granger is incomplete
        </Typography>
        <Chip color="error" label="Overdue" />
      </Stack>
    ),
  },
];

export type Attendance = {
  day: number;
  status: string;
};

export const attendanceData: Attendance[] = [
  {
    day: 1,
    status: 'ON TIME',
  },
  {
    day: 2,
    status: 'ON TIME',
  },
  {
    day: 3,
    status: 'ABSENT',
  },
  {
    day: 4,
    status: 'ON TIME',
  },
  {
    day: 5,
    status: 'DELAYED',
  },
  {
    day: 6,
    status: 'ON TIME',
  },
  {
    day: 7,
    status: 'ON TIME',
  },
  {
    day: 8,
    status: 'DELAYED',
  },
  {
    day: 9,
    status: 'ON TIME',
  },
  {
    day: 10,
    status: 'ON TIME',
  },
  {
    day: 11,
    status: 'LEAVE',
  },
  {
    day: 12,
    status: 'ON TIME',
  },
  {
    day: 13,
    status: 'LEAVE',
  },
  {
    day: 14,
    status: 'DELAYED',
  },
  {
    day: 15,
    status: 'ON TIME',
  },
  {
    day: 16,
    status: 'ABSENT',
  },
  {
    day: 17,
    status: 'ON TIME',
  },
  {
    day: 18,
    status: 'ON TIME',
  },
  {
    day: 19,
    status: 'ON TIME',
  },

  {
    day: 20,
    status: 'ON TIME',
  },
  {
    day: 21,
    status: 'ON TIME',
  },
  {
    day: 22,
    status: 'ON TIME',
  },
  {
    day: 23,
    status: 'ON TIME',
  },
  {
    day: 24,
    status: 'ON TIME',
  },
  {
    day: 25,
    status: 'ON TIME',
  },
  {
    day: 26,
    status: 'ON TIME',
  },
  {
    day: 27,
    status: 'ON TIME',
  },
  {
    day: 28,
    status: 'ON TIME',
  },
  {
    day: 29,
    status: 'LEAVE',
  },
  {
    day: 30,
    status: 'ON TIME',
  },
  {
    day: 31,
    status: 'DELAYED',
  },
];

export type OnLeaveUser = Omit<User, 'email' | 'status'> & {
  designation: string;
  empID: string;
};

export const leaveTodayData: OnLeaveUser[] = [
  { ...users[2], designation: 'Frontend Developer', empID: 'EMP001' }, //
  { ...users[13], designation: 'Backend Developer', empID: 'EMP002' }, //
  { ...users[15], designation: 'Full Stack Developer', empID: 'EMP003' }, //
  { ...users[3], designation: 'DevOps Engineer', empID: 'EMP004' }, //
  { ...users[12], designation: 'Data Scientist', empID: 'EMP005' },
  { ...users[9], designation: 'Quality Assurance Engineer', empID: 'EMP008' }, //
  { ...users[10], designation: 'Systems Analyst', empID: 'EMP009' }, //
  { ...users[11], designation: 'UX Engineer', empID: 'EMP010' }, //
];

export type LeaveHistory = {
  id: number;
  date: Date | [Date, Date];
  reason: string;
};

export const leaveHistoryDara: LeaveHistory[] = [
  {
    id: 1,
    date: new Date(2026, 2, 15),
    reason: 'Sick Leave',
  },
  {
    id: 2,
    date: [new Date(2025, 0, 2), new Date(2025, 0, 3)],
    reason: 'Sick Leave',
  },
  {
    id: 3,
    date: new Date(2024, 3, 10),
    reason: 'Sick Leave',
  },
  {
    id: 4,
    date: new Date(2024, 4, 5),
    reason: 'Vacation',
  },
  {
    id: 5,
    date: new Date(2025, 5, 20),
    reason: 'Paid Leave',
  },
  {
    id: 6,
    date: new Date(2025, 6, 30),
    reason: 'Sick Leave',
  },
  {
    id: 7,
    date: [new Date(2025, 9, 14), new Date(2025, 9, 17)],
    reason: 'Casual Leave',
  },
  {
    id: 8,
    date: new Date(2026, 1, 3),
    reason: 'Bereavement Leave',
  },
];
