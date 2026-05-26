import { Fragment } from 'react/jsx-runtime';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { WeeklyDayHour } from 'data/member/dashboard';

interface WeeklyFrequencyProps {
  days: WeeklyDayHour[];
}

const WeeklyFrequency = ({ days }: WeeklyFrequencyProps) => {
  const maxHour = Math.max(...days.map((day) => day.value));
  return (
    <GridWrapper>
      {days.map((day) => (
        <Fragment key={day.day}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', textTransform: 'capitalize', textAlign: 'center' }}
          >
            {day.day.slice(0, 3)}
          </Typography>
          <Box
            sx={{
              borderRadius: 4,
              bgcolor: 'chBlue.50',
              p: '1.14px 2.54px',
              height: 1,
            }}
          >
            <Box
              sx={{
                borderRadius: 4,
                width: `${day.value}%`,
                bgcolor: day.value === maxHour ? 'chBlue.400' : 'chBlue.200',
                height: 1,
              }}
            />
          </Box>
        </Fragment>
      ))}
    </GridWrapper>
  );
};

const GridWrapper = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: theme.spacing(3),
  alignItems: 'center',
  height: '100%',
}));

export default WeeklyFrequency;
