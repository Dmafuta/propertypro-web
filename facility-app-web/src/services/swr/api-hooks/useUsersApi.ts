'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  roles: string[];
  createdAt: string;
  isActive: boolean;
}

export interface InviteStaffPayload {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
}

export const useGetUsers = () =>
  useSWR<StaffUser[]>('/users', axiosFetcher);

export const useInviteUser = () =>
  useSWRMutation(
    '/users',
    (_url: string, { arg }: { arg: InviteStaffPayload }) =>
      axiosInstance.post('/users', arg),
  );

export const useUpdateUserRole = () =>
  useSWRMutation(
    '/users/role',
    (_url: string, { arg }: { arg: { id: string; role: string | null } }) =>
      axiosInstance.patch(`/users/${arg.id}/role`, { role: arg.role }),
  );

export const useDeactivateUser = () =>
  useSWRMutation(
    '/users/deactivate',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/users/${arg}/deactivate`),
  );

export const useActivateUser = () =>
  useSWRMutation(
    '/users/activate',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/users/${arg}/activate`),
  );
