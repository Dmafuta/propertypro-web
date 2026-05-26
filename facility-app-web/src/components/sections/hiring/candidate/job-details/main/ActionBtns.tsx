import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import paths from 'routes/paths';

const ActionBtns = () => {
  return (
    <Stack direction="row" sx={{ gap: 2, justifyContent: 'space-between' }}>
      <Button color="neutral">Cancel</Button>
      <Stack direction="row" sx={{ gap: 1 }}>
        <Button variant="soft" color="neutral">
          Save
        </Button>
        <Button href={paths.hiringJobApplication} variant="contained">
          Apply Now
        </Button>
      </Stack>
    </Stack>
  );
};

export default ActionBtns;
