import { PropsWithChildren } from 'react';
import { Button, Paper, Stack, SxProps, Theme, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface PanelWrapperProps {
  title: string;
  sx?: SxProps<Theme>;
}

const PanelWrapper = ({ title, children, sx }: PropsWithChildren<PanelWrapperProps>) => {
  return (
    <Stack sx={{ gap: 3, ...sx }}>
      <Paper background={2} sx={{ px: 2, py: 1, borderRadius: 2, outline: 0 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>

          <Button shape="square" variant="soft" size="small" color="neutral">
            <IconifyIcon icon="material-symbols:edit-outline" sx={{ fontSize: 18 }} />
          </Button>
        </Stack>
      </Paper>
      {children}
    </Stack>
  );
};

export default PanelWrapper;
