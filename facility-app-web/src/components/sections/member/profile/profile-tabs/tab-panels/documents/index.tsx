import { Box, Grid, Stack, Typography, styled } from '@mui/material';
import { documentsData } from 'data/member/profile';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import PanelWrapper from '../PanelWrapper';

const lineClampSx = (lineCount: number) => ({
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical' as const,
  WebkitLineClamp: lineCount,
  overflowWrap: 'break-word' as const,
});

interface DocumentsTabPanelProps {
  data: typeof documentsData;
}

export const DocumentsTabPanel = ({ data }: DocumentsTabPanelProps) => {
  return (
    <PanelWrapper title="Documentations">
      <Box sx={{ px: { xs: 0, md: 3 }, py: 2 }}>
        <Grid container rowSpacing={3} columnSpacing={{ xs: 2, sm: 1 }}>
          {data.map((item) => {
            const subline =
              item.files && !item.date
                ? `${item.files} files`
                : item.date && !item.files
                  ? dayjs(item.date).format('DD MMM, YYYY')
                  : '';

            return (
              <Grid key={item.id} size={{ xs: 6, sm: 4 }} sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    minWidth: 0,
                  }}
                >
                  <IconWrapper>
                    <IconifyIcon icon={item.icon} sx={{ fontSize: 48 }} />
                  </IconWrapper>

                  <Stack sx={{ gap: 0.5, minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, minWidth: 0, ...lineClampSx(2) }}
                      title={item.name}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 400,
                        color: 'text.secondary',
                        minWidth: 0,
                        ...lineClampSx(1),
                      }}
                      title={subline || undefined}
                    >
                      {subline}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </PanelWrapper>
  );
};

const IconWrapper = styled('figure')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 0,
  borderRadius: Number(theme.shape.borderRadius) * 2,
  backgroundColor: theme.vars.palette.background.elevation1,
}));
