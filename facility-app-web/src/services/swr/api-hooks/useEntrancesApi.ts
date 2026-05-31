'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export interface EntranceDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface EntrancePayload {
  name: string;
  description?: string | null;
}

export const useGetEntrances = () =>
  useSWR<EntranceDto[]>('/entrances', axiosFetcher);

export const useCreateEntrance = () =>
  useSWRMutation(
    '/entrances',
    (_url: string, { arg }: { arg: EntrancePayload }) =>
      axiosInstance.post<EntranceDto>('/entrances', arg),
  );

export const useUpdateEntrance = () =>
  useSWRMutation(
    '/entrances/update',
    (_url: string, { arg }: { arg: { id: string } & EntrancePayload }) =>
      axiosInstance.put(`/entrances/${arg.id}`, { name: arg.name, description: arg.description }),
  );

export const useToggleEntrance = () =>
  useSWRMutation(
    '/entrances/toggle',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/entrances/${arg}/toggle`),
  );

export const useDeleteEntrance = () =>
  useSWRMutation(
    '/entrances/delete',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.delete(`/entrances/${arg}`),
  );
