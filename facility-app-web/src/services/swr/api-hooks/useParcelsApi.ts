'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── Enums ─────────────────────────────────────────────────────────────────────
export const PARCEL_STATUSES = [
  { value: 0, label: 'Pending',   color: 'warning' as const },
  { value: 1, label: 'Collected', color: 'success' as const },
  { value: 2, label: 'Returned',  color: 'neutral' as const },
];

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface ParcelDto {
  id: string;
  unit: { id: string; unitNumber: string } | null;
  recipientName: string;
  courierName: string | null;
  description: string;
  receivedBy: { id: string; fullName: string; firstName: string; lastName: string };
  receivedAt: string;
  /** 0=Pending 1=Collected 2=Returned */
  status: number;
  collectedAt: string | null;
  collectedByName: string | null;
  notes: string | null;
}

export interface ReceiveParcelPayload {
  unitId?: string | null;
  recipientName: string;
  courierName?: string | null;
  description: string;
  notes?: string | null;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetParcels = (status?: number) =>
  useSWR<ParcelDto[]>(
    `/parcels${status !== undefined ? `?status=${status}` : ''}`,
    axiosFetcher,
  );

export const useGetPendingParcelCount = () =>
  useSWR<{ count: number }>('/parcels/pending-count', axiosFetcher);

export const useReceiveParcel = () =>
  useSWRMutation(
    '/parcels/receive',
    (_url: string, { arg }: { arg: ReceiveParcelPayload }) =>
      axiosInstance.post<ParcelDto>('/parcels', arg),
  );

export const useCollectParcel = () =>
  useSWRMutation(
    '/parcels/collect',
    (_url: string, { arg }: { arg: { id: string; collectedByName: string } }) =>
      axiosInstance.patch(`/parcels/${arg.id}/collect`, { collectedByName: arg.collectedByName }),
  );

export const useReturnParcel = () =>
  useSWRMutation(
    '/parcels/return',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/parcels/${arg}/return`, {}),
  );
