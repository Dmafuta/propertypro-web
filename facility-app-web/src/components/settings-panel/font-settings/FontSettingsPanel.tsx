'use client';

import { Stack } from '@mui/material';
import FontFamilyPanel from './FontFamilyPanel';
import FontSizePanel from './FontSizePanel';

const FontSettingsPanel = () => {
  return (
    <Stack sx={{ gap: 3 }}>
      <FontFamilyPanel />
      <FontSizePanel />
    </Stack>
  );
};

export default FontSettingsPanel;
