import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useHiringContext } from 'providers/HiringProvider';

const ActiveSearchFilter = ({ search }: { search: string }) => {
  const {
    candidate: { jobs },
  } = useHiringContext();

  const jobsCount = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.name.toLowerCase().includes(search.toLowerCase()) ||
      job.overview.location.toLowerCase().includes(search.toLowerCase()),
  ).length;

  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" sx={{ gap: 1.5 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
          }}
        >
          Searched for
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 500,
          }}
        >
          '{search}'
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ gap: 1.5 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
          }}
        >
          {jobsCount}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 500,
          }}
        >
          {jobsCount === 1 ? 'Job' : 'Jobs'} Matched
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ActiveSearchFilter;
