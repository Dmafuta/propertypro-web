'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface ConsumableTypeDto {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface ConsumableIssuanceDto {
  id: string;
  consumableTypeId: string;
  consumableTypeName: string;
  consumableUnit: string;
  unitId: string;
  unitNumber: string;
  block: string | null;
  quantity: number;
  issuedAt: string;
  issuedBy: string;
  notes: string | null;
  createdAt: string;
}

export interface ConsumableIssuanceForUnitDto {
  id: string;
  consumableTypeId: string;
  consumableTypeName: string;
  consumableUnit: string;
  quantity: number;
  issuedAt: string;
  issuedBy: string;
  notes: string | null;
  createdAt: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetConsumableTypes = () =>
  useSWR<ConsumableTypeDto[]>('/consumables/types', axiosFetcher);

export const useGetConsumableIssuances = (params?: {
  typeId?: string;
  unitId?: string;
  from?: string;
  to?: string;
}) => {
  const query = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
    : '';
  return useSWR<ConsumableIssuanceDto[]>(`/consumables/issuances${query}`, axiosFetcher);
};

export const useGetConsumableIssuancesForUnit = (unitId: string | null) =>
  useSWR<ConsumableIssuanceForUnitDto[]>(
    unitId ? `/consumables/issuances/unit/${unitId}` : null,
    axiosFetcher,
  );

export const useCreateConsumableType = () =>
  useSWRMutation('/consumables/types/create', (_url: string, { arg }: { arg: {
    name: string; unit: string; lowStockThreshold?: number | null;
  }}) => axiosInstance.post<{ id: string }>('/consumables/types', arg));

export const useRestockConsumable = () =>
  useSWRMutation('/consumables/restock', (_url: string, { arg }: { arg: {
    id: string; quantity: number;
  }}) => axiosInstance.patch(`/consumables/types/${arg.id}/restock`, { quantity: arg.quantity }));

export const useToggleConsumableType = () =>
  useSWRMutation('/consumables/toggle', (_url: string, { arg }: { arg: string }) =>
    axiosInstance.patch(`/consumables/types/${arg}/toggle`));

export const useIssueConsumable = () =>
  useSWRMutation('/consumables/issue', (_url: string, { arg }: { arg: {
    consumableTypeId: string; unitId: string; quantity: number;
    issuedAt: string; notes?: string | null;
  }}) => axiosInstance.post('/consumables/issue', arg));
