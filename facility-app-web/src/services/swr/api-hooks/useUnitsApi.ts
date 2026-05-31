'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── Enums (match backend) ─────────────────────────────────────────────────────
export const UNIT_STATUS: Record<number, string> = {
  0: 'Available', 1: 'Occupied', 2: 'Vacant', 3: 'Under Maintenance', 4: 'Reserved',
};

export const STATUS_COLORS: Record<number, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  0: 'success', 1: 'info', 2: 'warning', 3: 'error', 4: 'default',
};

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface UnitOccupant { id: string; fullName: string; email: string; }
export interface UnitOwner { id: string; fullName: string; email: string; }

export interface UnitDto {
  id: string;
  unitNumber: string;
  block: string | null;
  floor: string | null;
  description: string | null;
  status: number;
  statusLabel: string;
  sizeM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingBays: number;
  monthlyLevy: number | null;
  notes: string | null;
  unitTypeId: string | null;
  unitTypeName: string | null;
  createdAt: string;
  owner: UnitOwner | null;
  occupants: UnitOccupant[];
  meterCount: number;
}

export interface UnitDetailDto extends UnitDto {
  defaultMonthlyLevy: number | null;
  allUserUnits: {
    id: string; userId: string; fullName: string;
    linkType: string; linkedAt: string;
    moveInDate: string | null; moveOutDate: string | null;
  }[];
  meters: {
    id: string; meterNumber: string; serialNumber: string | null;
    utilityType: string; meterMode: string;
    location: string | null; unitOfMeasure: string | null;
    isActive: boolean; installDate: string; retiredAt: string | null;
  }[] | null;
}

export interface AssignableUser { id: string; fullName: string; email: string; type?: string; }

export interface UnitPayload {
  unitNumber: string; block?: string | null; floor?: string | null;
  description?: string | null; unitTypeId?: string | null;
  status: number; sizeM2?: number | null; bedrooms?: number | null;
  bathrooms?: number | null; parkingBays: number;
  monthlyLevy?: number | null; notes?: string | null;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetUnits = () => useSWR<UnitDto[]>('/units', axiosFetcher);

export const useGetUnit = (id: string | null) =>
  useSWR<UnitDetailDto>(id ? `/units/${id}` : null, axiosFetcher);

export const useGetAssignableOwners = () =>
  useSWR<AssignableUser[]>('/units/assignable/owners', axiosFetcher);

export const useGetAssignableOccupants = () =>
  useSWR<AssignableUser[]>('/units/assignable/occupants', axiosFetcher);

export const useCreateUnit = () =>
  useSWRMutation('/units', (_url: string, { arg }: { arg: UnitPayload }) =>
    axiosInstance.post<{ id: string }>('/units', arg));

export const useUpdateUnit = () =>
  useSWRMutation('/units/update', (_url: string, { arg }: { arg: { id: string } & UnitPayload }) =>
    axiosInstance.put(`/units/${arg.id}`, arg));

export const usePatchUnitStatus = () =>
  useSWRMutation('/units/status', (_url: string, { arg }: { arg: { id: string; status: number } }) =>
    axiosInstance.patch(`/units/${arg.id}/status`, { status: arg.status }));

export const useDeleteUnit = () =>
  useSWRMutation('/units/delete', (_url: string, { arg }: { arg: string }) =>
    axiosInstance.delete(`/units/${arg}`));

export const useSetOwner = () =>
  useSWRMutation('/units/owner', (_url: string, { arg }: { arg: { unitId: string; userId: string } }) =>
    axiosInstance.put(`/units/${arg.unitId}/owner`, { userId: arg.userId }));

export const useRemoveOwner = () =>
  useSWRMutation('/units/owner/remove', (_url: string, { arg }: { arg: string }) =>
    axiosInstance.delete(`/units/${arg}/owner`));

export const useAddOccupant = () =>
  useSWRMutation('/units/occupants/add',
    (_url: string, { arg }: { arg: { unitId: string; userId: string; moveInDate?: string | null } }) =>
      axiosInstance.post(`/units/${arg.unitId}/occupants`, { userId: arg.userId, moveInDate: arg.moveInDate }));

export const useRemoveOccupant = () =>
  useSWRMutation('/units/occupants/remove',
    (_url: string, { arg }: { arg: { unitId: string; userId: string; moveOutDate?: string | null } }) =>
      axiosInstance.delete(`/units/${arg.unitId}/occupants/${arg.userId}`,
        { data: { moveOutDate: arg.moveOutDate } }));
