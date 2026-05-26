import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getRangeLabel } from 'lib/utils';
import { Job } from 'types/hiring';

interface CompanyInfoProps {
  company: Job['company'];
}

const CompanyInfo = ({ company }: CompanyInfoProps) => {
  return (
    <Stack sx={{ gap: 1 }}>
      <Stack
        direction={{ xs: 'row', md: 'column', lg: 'row' }}
        sx={{ gap: 2, alignItems: 'flex-start' }}
      >
        <Avatar
          variant="rounded"
          src={company.logo}
          alt={company.logo}
          sx={{ width: 48, height: 48, borderRadius: 2, flexShrink: 0, bgcolor: 'transparent' }}
        />
        <Stack sx={{ gap: 0.5 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: 'neutral.main',
            }}
          >
            {company.name}
          </Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              {company.type}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              {getRangeLabel(company.employees)} Employyes
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          lineClamp: 2,
          overflow: 'hidden',
        }}
      >
        {company.desc}
      </Typography>
    </Stack>
  );
};

export default CompanyInfo;
