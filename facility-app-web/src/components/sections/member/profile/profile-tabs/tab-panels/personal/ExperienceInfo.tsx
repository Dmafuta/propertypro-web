import { Avatar, Box, Stack, Typography } from '@mui/material';
import { personalData } from 'data/member/profile';
import dayjs from 'dayjs';

interface ExperienceInfoProps {
  data: (typeof personalData)['experiences'];
}

const ExperienceInfo = ({ data }: ExperienceInfoProps) => {
  return (
    <div>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Experiences
      </Typography>
      <Stack
        sx={{
          gap: 3,
        }}
      >
        {data.map((item, index) => (
          <ExperienceEntry key={index} entry={item} />
        ))}
      </Stack>
    </div>
  );
};

const ExperienceEntry = ({ entry }: { entry: (typeof personalData)['experiences'][number] }) => {
  return (
    <Stack
      direction="row"
      sx={{
        gap: 2,
      }}
    >
      <Avatar
        src={entry.icon}
        sx={{ width: 40, height: 40, bgcolor: 'transparent', '& img': { objectFit: 'contain' } }}
      />
      <Stack
        sx={{
          gap: 1,
        }}
      >
        <Typography variant="subtitle2">
          <Box component="strong" sx={{ fontWeight: 700 }}>
            {entry.designation}{' '}
          </Box>
          <Box component="span" sx={{ fontWeight: 400 }}>
            at{' '}
          </Box>
          <Box component="strong" sx={{ fontWeight: 700 }}>
            {entry.company}
          </Box>
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 400, color: 'text.secondary' }}>
          {entry.location}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {dayjs(entry.startDate).format('MMM, YYYY')} - {dayjs(entry.endDate).format('MMM, YYYY')}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ExperienceInfo;
