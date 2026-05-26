import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { convertSize } from 'lib/utils';
import { StorageCategory } from 'types/accounts';
import IconifyIcon from 'components/base/IconifyIcon';

interface StorageCategoryCardProps {
  storageCategory: StorageCategory;
}

const StorageCategoryCard = ({ storageCategory }: StorageCategoryCardProps) => {
  const { icon, fileCount, name, spaceUsedinKb, color } = storageCategory;

  return (
    <Stack
      sx={{
        p: 3,
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.elevation1',
        borderRadius: 2,
      }}
    >
      {icon && <IconifyIcon icon={icon} sx={{ mb: 2, fontSize: 40, color: color }} />}
      <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700, textAlign: 'center' }}>
        {name}
      </Typography>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        sx={{ gap: 1, mb: 2 }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {fileCount} Files
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {convertSize(spaceUsedinKb)} GB
        </Typography>
      </Stack>

      <Button fullWidth>View</Button>
    </Stack>
  );
};

export default StorageCategoryCard;
