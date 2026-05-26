import { Stack } from '@mui/material';
import ContentSettingsForm from './ContentSettingsForm';
import PrimaryContentForm from './PrimaryContentForm';

const BlogInfo = () => {
  return (
    <Stack sx={{ gap: 4 }}>
      <PrimaryContentForm />
      <ContentSettingsForm />
    </Stack>
  );
};

export default BlogInfo;
