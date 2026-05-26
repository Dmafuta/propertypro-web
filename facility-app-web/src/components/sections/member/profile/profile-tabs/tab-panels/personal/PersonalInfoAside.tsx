import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { personalData } from 'data/member/profile';

interface PersonalInfoAsideProps {
  data: (typeof personalData)['overview'];
}

const FieldBlock = ({
  label,
  value,
  labelNoWrap = false,
}: {
  label: string;
  value: string;
  labelNoWrap?: boolean;
}) => (
  <Stack sx={{ gap: 1 }}>
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: 400,
        color: 'text.secondary',
        ...(labelNoWrap ? { textWrap: 'nowrap' } : {}),
      }}
    >
      {label}
    </Typography>
    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Stack>
);

const PersonalInfoAside = ({ data }: PersonalInfoAsideProps) => {
  const leftColumn = data.slice(0, 4);
  const rightColumn = data.slice(4);

  return (
    <Paper
      component="aside"
      background={1}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        outline: 0,
        height: { xs: 'auto', md: 1 },
      }}
    >
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Stack sx={{ gap: 2, mb: 3 }}>
          {leftColumn.map((item) => (
            <FieldBlock key={item.label} label={item.label} value={item.value} labelNoWrap />
          ))}
        </Stack>
        <Stack sx={{ gap: 2 }}>
          {rightColumn.map((item) => (
            <FieldBlock key={item.label} label={item.label} value={item.value} />
          ))}
        </Stack>
      </Box>

      <Stack sx={{ gap: 2, display: { xs: 'flex', sm: 'none' } }}>
        {data.map((item) => (
          <FieldBlock key={item.label} label={item.label} value={item.value} />
        ))}
      </Stack>
      <Grid
        container
        columns={12}
        spacing={2}
        sx={{ display: { xs: 'none', sm: 'flex', md: 'none' } }}
      >
        <Grid size={6}>
          <Stack sx={{ gap: 2 }}>
            {leftColumn.map((item) => (
              <FieldBlock key={item.label} label={item.label} value={item.value} />
            ))}
          </Stack>
        </Grid>
        <Grid size={6}>
          <Stack sx={{ gap: 2 }}>
            {rightColumn.map((item) => (
              <FieldBlock key={item.label} label={item.label} value={item.value} />
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PersonalInfoAside;
