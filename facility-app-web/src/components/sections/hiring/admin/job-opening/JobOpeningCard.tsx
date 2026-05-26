import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import paths from 'routes/paths';
import { JobOpening } from 'types/hiring';
import DashboardMenu from 'components/common/DashboardMenu';

interface JobOpeningCardProps {
  job: JobOpening;
}

const JobOpeningCard = ({ job }: JobOpeningCardProps) => {
  return (
    <Paper
      component={Link}
      href={paths.hiringJobDetails()}
      underline="none"
      background={1}
      sx={{
        p: 3,
        display: 'block',
        borderRadius: 6,
        outline: 0,
        height: 1,
        '&:hover': { bgcolor: 'background.elevation2' },
      }}
    >
      <Stack
        sx={{
          height: 1,
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        <Stack sx={{ gap: 2 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Stack sx={{ gap: 0.5 }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.5,
                  lineClamp: 2,
                }}
              >
                {job.title}
              </Typography>
              <Stack direction="row" sx={{ gap: 2 }}>
                <Typography
                  component="span"
                  variant="subtitle2"
                  sx={{
                    fontWeight: 400,
                  }}
                >
                  {job.field}
                </Typography>
                <Typography
                  component="span"
                  variant="subtitle2"
                  sx={{
                    fontWeight: 400,
                  }}
                >
                  {job.branch} branch
                </Typography>
              </Stack>
            </Stack>

            <DashboardMenu />
          </Stack>

          <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                {job.vacancy}
              </Box>
              {` `}Vacancy
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                {job.candidates}
              </Box>
              {` `}Candidates
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                {job.hiringLead}
              </Box>
              {` `}Hiring Lead
            </Typography>
          </Stack>
        </Stack>
        <Stack
          direction="row"
          sx={{ gap: 1, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {job.tags.map((tag, index) => (
              <Chip key={index} label={tag.label} color={tag.color} />
            ))}
          </Stack>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              lineHeight: 1.5,
              color: 'text.secondary',
            }}
          >
            {dayjs(job.postedDate).format('MMM D, YYYY')}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default JobOpeningCard;
