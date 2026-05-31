'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── Enums ─────────────────────────────────────────────────────────────────────
export const MAINTENANCE_CATEGORIES = [
  { value: 0, label: 'Plumbing',   icon: 'material-symbols:plumbing-rounded' },
  { value: 1, label: 'Electrical', icon: 'material-symbols:electric-bolt-rounded' },
  { value: 2, label: 'HVAC',       icon: 'material-symbols:hvac-rounded' },
  { value: 3, label: 'Structural', icon: 'material-symbols:home-work-outline-rounded' },
  { value: 4, label: 'Appliance',  icon: 'material-symbols:kitchen-outline-rounded' },
  { value: 5, label: 'Pest',       icon: 'material-symbols:pest-control-rounded' },
  { value: 6, label: 'Cleaning',   icon: 'material-symbols:cleaning-services-outline-rounded' },
  { value: 7, label: 'Other',      icon: 'material-symbols:build-outline-rounded' },
];

export const MAINTENANCE_PRIORITIES = [
  { value: 0, label: 'Low',    color: 'success' as const },
  { value: 1, label: 'Medium', color: 'warning' as const },
  { value: 2, label: 'High',   color: 'error'   as const },
  { value: 3, label: 'Urgent', color: 'error'   as const },
];

export const MAINTENANCE_STATUSES = [
  { value: 0, label: 'Open',        color: 'warning' as const },
  { value: 1, label: 'In Progress', color: 'info'    as const },
  { value: 2, label: 'Resolved',    color: 'success' as const },
  { value: 3, label: 'Closed',      color: 'neutral' as const },
];

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface UserSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
}

export interface MaintenanceDto {
  id: string;
  resident: UserSummaryDto;
  unit: { id: string; unitNumber: string } | null;
  title: string;
  description: string;
  /** 0=Plumbing 1=Electrical 2=HVAC 3=Structural 4=Appliance 5=Pest 6=Cleaning 7=Other */
  category: number;
  /** 0=Low 1=Medium 2=High 3=Urgent */
  priority: number;
  /** 0=Open 1=InProgress 2=Resolved 3=Closed */
  status: number;
  staffNote: string | null;
  createdAt: string;
  updatedAt: string | null;
  resolvedAt: string | null;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetMaintenance = (status?: number) =>
  useSWR<MaintenanceDto[]>(
    `/maintenance${status !== undefined ? `?status=${status}` : ''}`,
    axiosFetcher,
  );

export const useGetMaintenanceOpenCount = () =>
  useSWR<{ count: number }>('/maintenance/open-count', axiosFetcher);

export const useUpdateMaintenanceStatus = () =>
  useSWRMutation(
    '/maintenance/update',
    (_url: string, { arg }: { arg: { id: string; status: number; staffNote?: string | null } }) =>
      axiosInstance.patch(`/maintenance/${arg.id}`, { status: arg.status, staffNote: arg.staffNote }),
  );
