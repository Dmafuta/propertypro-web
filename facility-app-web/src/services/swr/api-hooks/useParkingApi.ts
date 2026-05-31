'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface VehicleDto {
  id: string;
  plate: string;
  make: string;
  model: string;
  colour: string;
  vehicleType: string;
  ownerCategory: string;
  ownerId: string | null;
  ownerDisplay: string;
  tagNumber: string | null;
  tagStatus: string | null;
  tagId: string | null;
  registeredAt: string;
  notes: string | null;
}

export interface ParkingRecordDto {
  id: string;
  plate: string;
  recordType: string;
  tagNumber: string | null;
  ownerDisplay: string;
  enteredAt: string;
  exitedAt: string | null;
  duration: string | null;
  entryGate: string | null;
  exitGate: string | null;
  notes: string | null;
}

export interface VehicleStickerDto {
  vehicleId: string;
  tagNumber: string;
  tagId: string;
  plate: string;
  make: string;
  model: string;
  colour: string;
  vehicleType: string;
  ownerCategory: string;
  issuedAt: string;
  expiresAt: string | null;
}

// ── Enums ─────────────────────────────────────────────────────────────────────

export const VEHICLE_TYPES = [
  { value: 0, label: 'Car' },
  { value: 1, label: 'Motorcycle' },
  { value: 2, label: 'Truck' },
  { value: 3, label: 'Van' },
  { value: 4, label: 'Other' },
];

export const OWNER_CATEGORIES = [
  { value: 0, label: 'Resident' },
  { value: 1, label: 'Staff' },
  { value: 2, label: 'VIP' },
  { value: 3, label: 'Contractor' },
];

export const TAG_STATUSES: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  Active:    'success',
  Suspended: 'warning',
  Revoked:   'error',
  Expired:   'neutral',
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useGetVehicles = () =>
  useSWR<VehicleDto[]>('/parking/vehicles', axiosFetcher);

export const useGetMyVehicles = () =>
  useSWR<VehicleDto[]>('/parking/vehicles/my', axiosFetcher);

export const useGetActiveParking = () =>
  useSWR<ParkingRecordDto[]>('/parking/active', axiosFetcher, { refreshInterval: 30_000 });

export const useGetParkingHistory = (from: string, to: string) =>
  useSWR<ParkingRecordDto[]>(
    from && to ? `/parking/history?from=${from}&to=${to}` : null,
    axiosFetcher,
  );

export const useGetSticker = (vehicleId: string | null) =>
  useSWR<VehicleStickerDto>(
    vehicleId ? `/parking/vehicles/${vehicleId}/sticker` : null,
    axiosFetcher,
  );

export const useRegisterVehicle = () =>
  useSWRMutation('/parking/vehicles', (_url: string, { arg }: { arg: object }) =>
    axiosInstance.post('/parking/vehicles', arg).then(r => r.data));

export const useDeleteVehicle = () =>
  useSWRMutation('/parking/vehicles/delete', (_url: string, { arg }: { arg: string }) =>
    axiosInstance.delete(`/parking/vehicles/${arg}`));

export const useIssueTag = () =>
  useSWRMutation('/parking/tags', (_url: string, { arg }: { arg: object }) =>
    axiosInstance.post('/parking/tags', arg).then(r => r.data));

export const useUpdateTagStatus = () =>
  useSWRMutation('/parking/tags/status', (_url: string, { arg }: { arg: { tagId: string; status: number } }) =>
    axiosInstance.patch(`/parking/tags/${arg.tagId}/status`, { status: arg.status }));

export const useLogEntryByTag = () =>
  useSWRMutation('/parking/entry/tag', (_url: string, { arg }: { arg: object }) =>
    axiosInstance.post('/parking/entry/tag', arg).then(r => r.data as ParkingRecordDto));

export const useLogVisitorEntry = () =>
  useSWRMutation('/parking/entry/visitor', (_url: string, { arg }: { arg: object }) =>
    axiosInstance.post('/parking/entry/visitor', arg).then(r => r.data as ParkingRecordDto));

export const useLogExit = () =>
  useSWRMutation('/parking/exit', (_url: string, { arg }: { arg: { recordId: string; exitEntranceId?: string } }) =>
    axiosInstance.patch(`/parking/records/${arg.recordId}/exit`, { exitEntranceId: arg.exitEntranceId ?? null }));
