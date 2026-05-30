'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export interface UserProfile {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  userName: string;
  email: string;
  secondaryEmail: string | null;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  avatarUrl: string | null;
  roles: string[];
}

export interface UpdateProfilePayload {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}

export interface UpdateUsernamePayload {
  userName: string;
}

export interface UpdateEmailPayload {
  primaryEmail: string;
  secondaryEmail?: string | null;
}

export const useGetProfile = () =>
  useSWR<UserProfile>('/account/profile', axiosFetcher);

export const useUpdateProfile = () =>
  useSWRMutation(
    '/account/profile',
    (_url: string, { arg }: { arg: UpdateProfilePayload }) =>
      axiosInstance.patch('/account/profile', arg),
  );

export const useUpdateUsername = () =>
  useSWRMutation(
    '/account/username',
    (_url: string, { arg }: { arg: UpdateUsernamePayload }) =>
      axiosInstance.patch('/account/username', arg),
  );

export const useUpdateEmail = () =>
  useSWRMutation(
    '/account/email',
    (_url: string, { arg }: { arg: UpdateEmailPayload }) =>
      axiosInstance.patch('/account/email', arg),
  );

export const uploadAvatar = (file: File): Promise<{ avatarUrl: string }> => {
  const form = new FormData();
  form.append('file', file);
  return axiosInstance.post('/account/avatar', form) as Promise<{ avatarUrl: string }>;
};
