import { Box, Chip, Stack, Typography } from '@mui/material';
import { blogDetailsTags } from 'data/content/blog';

const BlogTags = () => {
  return (
    <Box sx={{ mb: { xs: 3, md: 5 } }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 2,
          color: 'text.secondary',
        }}
      >
        Tags
      </Typography>

      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        {blogDetailsTags.map((tag) => (
          <Chip key={tag.id} label={tag.label} />
        ))}
      </Stack>
    </Box>
  );
};

export default BlogTags;
