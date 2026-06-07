'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export const PASS_TYPES = [
  { value: 0, label: 'Gate', icon: 'material-symbols:door-front-outline-rounded' },
  { value: 1, label: 'Parking', icon: 'material-symbols:local-parking-rounded' },
  { value: 2, label: 'Both', icon: 'material-symbols:badge-outline-rounded' },
];

export interface AccessPassDto {
  id: string;
  passNumber: string;
  passType: string;
  passTypeValue: number;
  vehicleRegistration: string | null;
  parkingBay: string | null;
  validFrom: string;
  validUntil: string | null;
  isRevoked: boolean;
  revokedAt: string | null;
  revokedReason: string | null;
  createdAt: string;
  status: 'Active' | 'Revoked' | 'Expired';
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  visitId: string;
  visitPurpose: string | null;
  entranceName: string | null;
}

export interface PassPageDto {
  total: number;
  page: number;
  pageSize: number;
  items: AccessPassDto[];
}

export const useGetPasses = (params: {
  status?: string; search?: string; page?: number; pageSize?: number;
}) => {
  const query = new URLSearchParams();
  if (params.status)   query.set('status', params.status);
  if (params.search)   query.set('search', params.search);
  if (params.page)     query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  return useSWR<PassPageDto>(`/passes?${query}`, axiosFetcher);
};

export const useGetPassForVisit = (visitId: string | null) =>
  useSWR<AccessPassDto>(visitId ? `/passes/visit/${visitId}` : null, axiosFetcher);

export const useGeneratePass = () =>
  useSWRMutation('/passes/generate', (_url: string, { arg }: { arg: {
    visitId: string; passType: number;
    vehicleRegistration?: string | null;
    parkingBay?: string | null;
    validUntil?: string | null;
  }}) => axiosInstance.post<AccessPassDto>('/passes', arg));

export const useRevokePass = () =>
  useSWRMutation('/passes/revoke', (_url: string, { arg }: { arg: {
    id: string; reason?: string | null;
  }}) => axiosInstance.patch(`/passes/${arg.id}/revoke`, { reason: arg.reason }));
