import { Button, Paper, Stack } from '@mui/material';

const BottomBar = () => {
  return (
    <Paper
      background={1}
      sx={(theme) => ({
        display: 'flex',
        position: 'sticky',
        zIndex: 10,
        bottom: 0,
        px: { xs: 3, md: 5 },
        height: theme.mixins.footer.sm,
        justifyContent: 'flex-end',
      })}
    >
      <Stack direction="row" sx={{ gap: 1, alignSelf: 'center' }}>
        <Button type="button" variant="soft" color="neutral">
          Save Draft
        </Button>
        <Button type="button" variant="contained">
          Create Order
        </Button>
      </Stack>
    </Paper>
  );
};

export default BottomBar;
