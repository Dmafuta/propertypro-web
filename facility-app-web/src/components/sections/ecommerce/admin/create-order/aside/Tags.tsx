import { Autocomplete, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';

const Tags = () => {
  return (
    <Box
      sx={{
        p: { xs: 3, md: 5 },
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
          }}
        >
          Tags
        </Typography>

        <Button variant="text" size="small" sx={{ flexShrink: 0, minWidth: 0 }}>
          View all tags
        </Button>
      </Stack>
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        open={false}
        renderValue={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...rest } = getTagProps({ index });

            return (
              <Chip
                key={key}
                variant="soft"
                color="primary"
                sx={{ m: 0.5 }}
                label={option}
                {...rest}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField {...params} variant="filled" label="Tags" placeholder="Add tags" />
        )}
      />
    </Box>
  );
};

export default Tags;
