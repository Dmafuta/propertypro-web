'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export interface UnitTypeDto {
  id: string;
  name: string;
  description: string | null;
  defaultMonthlyLevy: number | null;
  defaultBedrooms: number | null;
  defaultBathrooms: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface UnitTypePayload {
  name: string;
  description?: string | null;
  defaultMonthlyLevy?: number | null;
  defaultBedrooms?: number | null;
  defaultBathrooms?: number | null;
}

export const useGetUnitTypes = () => useSWR<UnitTypeDto[]>('/unit-types', axiosFetcher);

export const useCreateUnitType = () =>
  useSWRMutation('/unit-types', (_url: string, { arg }: { arg: UnitTypePayload }) =>
    axiosInstance.post('/unit-types', arg));

export const useUpdateUnitType = () =>
  useSWRMutation('/unit-types/update',
    (_url: string, { arg }: { arg: { id: string } & UnitTypePayload }) =>
      axiosInstance.put(`/unit-types/${arg.id}`, arg));

export const useToggleUnitType = () =>
  useSWRMutation('/unit-types/toggle', (_url: string, { arg }: { arg: string }) =>
    axiosInstance.patch(`/unit-types/${arg}/toggle`));

export const useDeleteUnitType = () =>
  useSWRMutation('/unit-types/delete', (_url: string, { arg }: { arg: string }) =>
    axiosInstance.delete(`/unit-types/${arg}`));
