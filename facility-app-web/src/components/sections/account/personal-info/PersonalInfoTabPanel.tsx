'use client';

import { useState } from 'react';
import { Divider, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAccounts } from 'providers/AccountsProvider';
import { uploadAvatar } from 'services/swr/api-hooks/useAccountApi';
import AvatarDropBox from 'components/base/AvatarDropBox';
import AccountTabPanelSection from '../common/AccountTabPanelSection';
import Address from './Address';
import Birthday from './Birthday';
import Email from './Email';
import Names from './Names';
import Phone from './Phone';
import UserName from './UserName';

const PersonalInfoTabPanel = () => {
  const { personalInfo, refetchProfile } = useAccounts();
  const { enqueueSnackbar }              = useSnackbar();
  const [uploading, setUploading]        = useState(false);

  const handleAvatarDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length || uploading) return;
    setUploading(true);
    try {
      await uploadAvatar(acceptedFiles[0]);
      await refetchProfile();
      enqueueSnackbar('Profile photo updated!', { variant: 'success', autoHideDuration: 3000 });
    } catch (err: any) {
      enqueueSnackbar(err?.data?.error ?? 'Failed to upload photo.', { variant: 'error', autoHideDuration: 4000 });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'center', mb: 2 }}>
        <AvatarDropBox
          defaultFile={personalInfo.avatarUrl ?? undefined}
          disabled={uploading}
          onDrop={handleAvatarDrop}
        />
      </Stack>
      <Stack divider={<Divider />} sx={{ gap: 5 }}>
        <AccountTabPanelSection
          title="Name"
          subtitle="Edit your name here if you wish to make any changes. You can also edit your user name which will be showed publicly."
          icon="material-symbols:badge-outline"
        >
          <Stack sx={{ gap: 1 }}>
            <Names />
            <UserName />
          </Stack>
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Birthday"
          subtitle="Adjust your date of birth to ensure it's accurate in your account."
          icon="material-symbols:cake-outline"
        >
          <Birthday />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Address"
          subtitle="You can edit your address and control who can see it."
          icon="material-symbols:location-on-outline"
        >
          <Address />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Phone"
          subtitle="Add a personal or official phone number to stay connected with ease and ensure account recovery options are available."
          icon="material-symbols:call-outline"
        >
          <Phone />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Email Address"
          subtitle="Edit your primary email address for notifications and add an alternate email address for extra security and communication flexibility."
          icon="material-symbols:mail-outline"
        >
          <Email />
        </AccountTabPanelSection>
      </Stack>
    </>
  );
};

export default PersonalInfoTabPanel;
