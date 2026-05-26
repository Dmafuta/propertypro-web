'use client';

import { ReactElement, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { TabContext, TabList } from '@mui/lab';
import { Box, Paper, Stack, Tab, tabScrollButtonClasses, tabsClasses } from '@mui/material';
import {
  documentsData,
  jobData,
  payInfoData,
  personalData,
  teamOverviewData,
  timeOffData,
} from 'data/member/profile';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { HashLinkBehavior } from 'theme/components/Link';
import ScrollSpy, { useScrollSpyContext } from 'components/scroll-spy';
import ScrollSpyContent from 'components/scroll-spy/ScrollSpyContent';
import ScrollSpyNavItem from 'components/scroll-spy/ScrollSpyNavItem';
import {
  DocumentsTabPanel,
  JobTabPanel,
  PayInfoTabPanel,
  PersonalTabPanel,
  TeamOverviewTabPanel,
  TimeOffTabPanel,
} from './tab-panels';

type TabValue = 'personal' | 'job' | 'team-overview' | 'time-off' | 'pay-info' | 'documents';

const tabData: Array<{
  value: TabValue;
  label: string;
  panel: ReactElement;
}> = [
  { value: 'personal', label: 'Personal', panel: <PersonalTabPanel data={personalData} /> },
  { value: 'job', label: 'Job', panel: <JobTabPanel data={jobData} /> },
  {
    value: 'team-overview',
    label: 'Team Overview',
    panel: <TeamOverviewTabPanel data={teamOverviewData} />,
  },
  { value: 'time-off', label: 'Time Off', panel: <TimeOffTabPanel data={timeOffData} /> },
  { value: 'pay-info', label: 'Pay Info', panel: <PayInfoTabPanel data={payInfoData} /> },
  { value: 'documents', label: 'Documents', panel: <DocumentsTabPanel data={documentsData} /> },
];

const ProfileTabsInner = () => {
  const { down } = useBreakpoints();
  const isDownSm = down('sm');
  const tabsRef = useRef<HTMLDivElement>(null);
  const { topbarHeight } = useNavContext();
  const { activeElemId } = useScrollSpyContext();
  const [activeTab, setActiveTab] = useState<TabValue>(
    () => (activeElemId as TabValue) || 'personal',
  );

  const handleTabChange = (_event: SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (
      activeElemId &&
      activeTab !== activeElemId &&
      tabData.some((item) => item.value === activeElemId)
    ) {
      setActiveTab(activeElemId as TabValue);
    }
  }, [activeElemId, activeTab]);

  return (
    <Paper sx={{ outline: 0, bgcolor: 'transparent', boxShadow: 'none' }}>
      <TabContext value={activeTab}>
        <Box
          ref={tabsRef}
          sx={{
            position: 'sticky',
            zIndex: 10,
            mb: 3,
            top: topbarHeight,
            bgcolor: 'background.paper',
          }}
        >
          <ScrollSpyNavItem>
            <TabList
              variant={isDownSm ? 'scrollable' : 'standard'}
              scrollButtons
              allowScrollButtonsMobile
              onChange={handleTabChange}
              aria-label="profile tabs"
              centered={isDownSm ? false : true}
              sx={{
                py: 1,
                [`& .${tabsClasses.list}`]: { gap: 0, justifyContent: 'flex-start' },
                [`& .${tabScrollButtonClasses.disabled}`]: { opacity: '0.3 !important' },
              }}
            >
              {tabData.map(({ value, label }) => (
                <Tab
                  LinkComponent={HashLinkBehavior}
                  href={`#${value}`}
                  key={value}
                  value={value}
                  label={label}
                />
              ))}
            </TabList>
          </ScrollSpyNavItem>
        </Box>
      </TabContext>

      <Stack sx={{ gap: 5, mb: 7 }}>
        {tabData.map(({ value, panel }) => (
          <ScrollSpyContent
            key={value}
            id={value}
            sx={(theme) => ({
              scrollMarginTop: theme.mixins.topOffset(topbarHeight, 75, true),
            })}
          >
            {panel}
          </ScrollSpyContent>
        ))}
      </Stack>
    </Paper>
  );
};

const ProfileTabsSection = () => (
  <ScrollSpy offset={500}>
    <ProfileTabsInner />
  </ScrollSpy>
);

export default ProfileTabsSection;
