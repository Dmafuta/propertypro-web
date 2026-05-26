import { RefObject } from 'react';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Dayjs } from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';

interface CalendarHeaderProps {
  calendarRef?: RefObject<any> | null;
  currentDate: Dayjs;
}

const CalendarHeader = (props: CalendarHeaderProps) => {
  const { calendarRef, currentDate } = props;

  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Button
        shape="circle"
        variant="soft"
        color="neutral"
        onClick={() => calendarRef?.current?.goToPreviousMonth()}
      >
        <IconifyIcon flipOnRTL icon="material-symbols:chevron-left-rounded" sx={{ fontSize: 20 }} />
      </Button>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 16 }}>
        {currentDate.format('MMMM')}
      </Typography>

      <Button
        shape="circle"
        variant="soft"
        color="neutral"
        onClick={() => calendarRef?.current?.goToNextMonth()}
      >
        <IconifyIcon
          flipOnRTL
          icon="material-symbols:chevron-right-rounded"
          sx={{ fontSize: 20 }}
        />
      </Button>
    </Stack>
  );
};

export default CalendarHeader;
