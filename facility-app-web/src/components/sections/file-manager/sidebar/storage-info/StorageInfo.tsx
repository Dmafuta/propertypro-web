import { Stack, Typography } from '@mui/material';
import { fileStorageData } from 'data/file-manager';
import StorageBar from './StorageBar';
import StorageCTA from './StorageCTA';
import StorageSegmentList from './StorageSegmentList';

const StorageInfo = () => {
  return (
    <Stack sx={{ gap: 2, p: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
        }}
      >
        Your Storage
      </Typography>
      <StorageBar data={fileStorageData} />
      <StorageSegmentList data={fileStorageData} />
      <StorageCTA />
    </Stack>
  );
};

export default StorageInfo;
