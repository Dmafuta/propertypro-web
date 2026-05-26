import { Button, Container, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface TicketPurchaseToolbarProps {
  onPurchaseClick: () => void;
}

const TicketPurchaseToolbar = ({ onPurchaseClick }: TicketPurchaseToolbarProps) => {
  return (
    <Paper
      sx={({ mixins, vars }) => ({
        position: 'sticky',
        zIndex: 999,
        width: 1,
        bottom: 0,
        display: 'flex',
        bgcolor: vars.palette.background.menu,
        height: mixins.footer.sm,
      })}
    >
      <Container
        maxWidth={false}
        sx={{
          px: { xs: 3, md: 5 },
          py: 1,
          maxWidth: 1280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">10$ - 200$</Typography>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Button variant="soft" shape="square" color="neutral">
            <IconifyIcon icon="material-symbols:favorite-outline-rounded" width={20} height={20} />
          </Button>
          <Button variant="contained" onClick={onPurchaseClick}>
            Purchase
          </Button>
        </Stack>
      </Container>
    </Paper>
  );
};

export default TicketPurchaseToolbar;
