'use client';

import { createContext, PropsWithChildren, use } from 'react';
import { billingAddressData, shippingAddressData } from 'data/account/shipping-billing-address';
import { backupSyncSettings, storageData } from 'data/account/storage';
import { globalPermissions, userPermissions } from 'data/account/user-permissions';
import { educationHistory, workHistory } from 'data/account/work-education-history';
import { useGetProfile } from 'services/swr/api-hooks/useAccountApi';
import {
  AddressInfo,
  BackupSyncSettings,
  EducationHistory,
  Permission,
  PersonalInfo,
  Storage,
  WorkHistory,
} from 'types/accounts';

interface AccountsContextInterface {
  personalInfo: PersonalInfo;
  profileLoading: boolean;
  refetchProfile: () => void;
  workHistory: WorkHistory[];
  educationHistory: EducationHistory[];
  usersPermissions: {
    globalPermissions: Permission[];
    collabPermission: 'anyone' | 'only_code';
    userPermissions: Permission[];
  };
  shippingBillingAddress: {
    shippingAddress: AddressInfo;
    billingAddress: AddressInfo;
  };
  storage: {
    backupSyncSettings: BackupSyncSettings[];
    storageData: Storage;
  };
}

export const AccountsContext = createContext({} as AccountsContextInterface);

const AccountsProvider = ({ children }: PropsWithChildren) => {
  const { data: profile, isLoading: profileLoading, mutate: refetchProfile } = useGetProfile();

  const personalInfo: PersonalInfo = {
    firstName:      profile?.firstName     ?? '',
    middleName:     profile?.middleName    ?? '',
    lastName:       profile?.lastName      ?? '',
    userName:       profile?.userName      ?? '',
    phoneNumber:    profile?.phoneNumber   ?? '',
    primaryEmail:   profile?.email         ?? '',
    secondaryEmail: profile?.secondaryEmail ?? '',
    avatarUrl:      profile?.avatarUrl     ?? null,
    // non-API fields kept as empty (not stored in our DB)
    birthDate: '',
    country:   '',
    state:     '',
    city:      '',
    street:    '',
    zip:       '',
  };

  return (
    <AccountsContext
      value={{
        personalInfo,
        profileLoading,
        refetchProfile,
        workHistory,
        educationHistory,
        usersPermissions: {
          globalPermissions,
          collabPermission: 'anyone',
          userPermissions,
        },
        shippingBillingAddress: {
          shippingAddress: shippingAddressData,
          billingAddress:  billingAddressData,
        },
        storage: {
          backupSyncSettings,
          storageData,
        },
      }}
    >
      {children}
    </AccountsContext>
  );
};

export const useAccounts = () => use(AccountsContext);

export default AccountsProvider;
