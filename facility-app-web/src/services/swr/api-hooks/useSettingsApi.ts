'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export interface TenantSettings {
  id: string;
  name: string;
  slug: string;
  plan: number;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  website: string | null;
  customDomain: string | null;
  primaryColour: string | null;
  logoUrl: string | null;
  smsEnabled: boolean;
  smsApiKey: string | null;
  smsUsername: string | null;
  smsSenderId: string | null;
}

export interface UpdateSmsPayload {
  enabled: boolean;
  apiKey?: string | null;
  username?: string | null;
  senderId?: string | null;
}

export const useGetSettings = () =>
  useSWR<TenantSettings>('/settings', axiosFetcher);

export const useUpdateSms = () =>
  useSWRMutation(
    '/settings/sms',
    (_url: string, { arg }: { arg: UpdateSmsPayload }) =>
      axiosInstance.patch('/settings/sms', arg),
  );
