import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CollapsiblePanel from '../common/CollapsiblePanel';
import CoverLetter from './CoverLetter';
import Resume from './Resume';

const Documents = () => {
  return (
    <Paper background={1} sx={{ outline: 0, p: 2, borderRadius: 4 }}>
      <CollapsiblePanel name="Documents">
        <Stack sx={{ gap: 4, px: 1, pt: 3 }}>
          <Resume />
          <CoverLetter />
        </Stack>
      </CollapsiblePanel>
    </Paper>
  );
};

export default Documents;
