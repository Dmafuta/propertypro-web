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
  // SMS
  smsEnabled: boolean;
  smsProvider: number;
  smsApiKey: string | null;
  smsUsername: string | null;
  smsSenderId: string | null;
  smsApiUrl: string | null;
  // Telegram
  telegramEnabled: boolean;
  telegramBotToken: string | null;
  // M-Pesa
  mpesaEnabled: boolean;
  mpesaSandbox: boolean;
  mpesaShortCode: string | null;
  mpesaConsumerKey: string | null;
  mpesaConsumerSecret: string | null;
  mpesaPasskey: string | null;
}

export interface UpdateSmsPayload {
  enabled: boolean;
  provider: number;
  apiKey?: string | null;
  username?: string | null;
  senderId?: string | null;
  apiUrl?: string | null;
}

export interface UpdateMpesaPayload {
  enabled: boolean;
  sandbox: boolean;
  shortCode?: string | null;
  consumerKey?: string | null;
  consumerSecret?: string | null;
  passkey?: string | null;
}

export interface UpdateTelegramPayload {
  enabled: boolean;
  botToken?: string | null;
}

export const SMS_PROVIDER_OPTIONS = [
  { value: 0, label: "Africa's Talking" },
  { value: 1, label: 'Twilio' },
  { value: 2, label: 'Vonage' },
  { value: 3, label: 'Custom HTTP' },
];

export interface UpdateSettingsPayload {
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  website?: string | null;
  customDomain?: string | null;
}

export interface UpdateBrandingPayload {
  logoUrl?: string | null;
  primaryColour?: string | null;
}

export const useGetSettings = () =>
  useSWR<TenantSettings>('/settings', axiosFetcher);

export const useUpdateSettings = () =>
  useSWRMutation(
    '/settings',
    (_url: string, { arg }: { arg: UpdateSettingsPayload }) =>
      axiosInstance.put('/settings', arg),
  );

export const useUpdateBranding = () =>
  useSWRMutation(
    '/settings/branding',
    (_url: string, { arg }: { arg: UpdateBrandingPayload }) =>
      axiosInstance.patch('/settings/branding', arg),
  );

export const useUpdateSms = () =>
  useSWRMutation(
    '/settings/sms',
    (_url: string, { arg }: { arg: UpdateSmsPayload }) =>
      axiosInstance.patch('/settings/sms', arg),
  );

export const useUpdateMpesa = () =>
  useSWRMutation(
    '/settings/mpesa',
    (_url: string, { arg }: { arg: UpdateMpesaPayload }) =>
      axiosInstance.patch('/settings/mpesa', arg),
  );

export const useUpdateTelegram = () =>
  useSWRMutation(
    '/settings/telegram',
    (_url: string, { arg }: { arg: UpdateTelegramPayload }) =>
      axiosInstance.patch('/settings/telegram', arg),
  );

export const useTelegramLinkStatus = () =>
  useSWR<{ linked: boolean }>('/telegram/link/status', axiosFetcher);

export const useTelegramGenerateLink = () =>
  useSWRMutation(
    '/telegram/link',
    (_url: string) => axiosInstance.post<{ linkToken: string; expiresInMinutes: number }>('/telegram/link'),
  );

export const useTelegramUnlink = () =>
  useSWRMutation(
    '/telegram/link/unlink',
    (_url: string) => axiosInstance.delete('/telegram/link'),
  );
