import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import { newHiresData as data } from 'data/hiring/dashboard';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import SectionWrapper from '../common/SectionWrapper';
import NewJoiner from './NewJoiner';

const NewHires = () => {
  return (
    <Stack component={SectionWrapper}>
      <SectionHeader
        title="New Hires"
        subTitle="Recent joiners by date, role"
        actionComponent={<DashboardMenu size="medium" />}
      />

      <Stack
        component="ul"
        divider={<Divider flexItem sx={{ borderColor: 'dividerLight' }} />}
        sx={{ m: 0, p: 0 }}
      >
        {data.map((item) => (
          <NewJoiner key={item.id} hire={item} />
        ))}
      </Stack>
    </Stack>
  );
};

export default NewHires;
