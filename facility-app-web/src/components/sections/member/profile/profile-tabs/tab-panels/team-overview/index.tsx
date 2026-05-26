import { Divider, Stack } from '@mui/material';
import { teamOverviewData } from 'data/member/profile';
import PanelWrapper from '../PanelWrapper';
import ProjectList from './ProjectList';
import TeamsStats from './TeamsStats';

interface TeamOverviewTabPanelProps {
  data: typeof teamOverviewData;
}

export const TeamOverviewTabPanel = ({ data }: TeamOverviewTabPanelProps) => {
  return (
    <PanelWrapper title="Team Overview">
      <Stack divider={<Divider flexItem />}>
        <TeamsStats data={data.assignedTeams} />
        <ProjectList data={data.projectList} />
      </Stack>
    </PanelWrapper>
  );
};
