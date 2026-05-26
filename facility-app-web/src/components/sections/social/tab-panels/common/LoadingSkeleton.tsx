import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const LoadingSkeleton = () => {
  return (
    <Stack direction="row" sx={{ gap: 2, py: 1 }}>
      <Skeleton variant="circular" sx={{ width: 32, height: 32, bgcolor: 'grey.200' }} />
      <Stack sx={{ gap: 2, flexGrow: 1 }}>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <Skeleton
            variant="rounded"
            sx={{ maxWidth: 170, width: 1, height: 16, borderRadius: 3.5, bgcolor: 'grey.200' }}
          />
          <Skeleton
            variant="rounded"
            sx={{ maxWidth: 115, width: 1, height: 12, borderRadius: 3.5, bgcolor: 'grey.100' }}
          />
        </Stack>
        <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
          <Skeleton
            variant="rounded"
            sx={{ width: 1, height: 16, borderRadius: 3.5, bgcolor: 'grey.200' }}
          />
          <Skeleton
            variant="rounded"
            sx={{ maxWidth: 391, width: 1, height: 16, borderRadius: 3.5, bgcolor: 'grey.200' }}
          />
        </Stack>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          <Skeleton
            variant="rounded"
            sx={{ maxWidth: 36, width: 1, height: 10, borderRadius: 3.5, bgcolor: 'grey.100' }}
          />
          <Skeleton
            variant="rounded"
            sx={{ maxWidth: 36, width: 1, height: 10, borderRadius: 3.5, bgcolor: 'grey.100' }}
          />
          <Skeleton
            variant="rounded"
            sx={{ maxWidth: 36, width: 1, height: 10, borderRadius: 3.5, bgcolor: 'grey.100' }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LoadingSkeleton;
