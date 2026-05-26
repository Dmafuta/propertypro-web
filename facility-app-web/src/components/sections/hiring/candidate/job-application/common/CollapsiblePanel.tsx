import { PropsWithChildren, useState } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

const CollapsiblePanel = ({ name, children }: PropsWithChildren<{ name: string }>) => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Stack
        direction="row"
        component={ButtonBase}
        disableRipple
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          justifyContent: 'space-between',
          width: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            lineHeight: 1.5,
            fontWeight: 600,
          }}
        >
          {name}
        </Typography>
        <IconifyIcon
          icon="material-symbols:keyboard-arrow-down"
          sx={{ fontSize: 18, rotate: open ? '180deg' : '0deg' }}
        />
      </Stack>
      <Collapse in={open} unmountOnExit>
        {children}
      </Collapse>
    </>
  );
};

export default CollapsiblePanel;
