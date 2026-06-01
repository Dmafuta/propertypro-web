'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export interface AppRoleItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  permissions: number[];
}

export interface PermissionDef {
  value: number;
  name: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string | null;
  permissions?: number[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string | null;
}

// ── Permission enum values (must match backend Permission enum) ────────────────
export const PERMISSIONS = {
  CanCheckInVisitors:     1,
  CanPreRegisterVisits:   2,
  CanManageVisitors:      3,
  CanManageAccess:        4,
  CanViewReports:         5,
  CanViewDashboard:       6,
  CanManageAuditLog:      7,
  CanManageUsers:         8,
  CanManageUnits:         9,
  CanManageSettings:      10,
  CanManageFacilities:    11,
  CanManageEntrances:     12,
  CanLogIncidents:        13,
  CanManageIncidents:     14,
  CanAccessParking:       15,
  CanManageParking:       16,
  CanManageParcels:       17,
  CanManageMaintenance:   18,
  CanManagePayments:      19,
  CanManageDocuments:     20,
  CanManageAnnouncements: 21,
  CanManageHr:            22,
} as const;

export type PermissionValue = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface PermissionGroup {
  label: string;
  icon: string;
  permissions: { value: number; label: string }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'Access Control',
    icon: 'material-symbols:how-to-reg-outline-rounded',
    permissions: [
      { value: PERMISSIONS.CanCheckInVisitors,   label: 'Check-in visitors' },
      { value: PERMISSIONS.CanPreRegisterVisits,  label: 'Pre-register visits' },
      { value: PERMISSIONS.CanManageVisitors,     label: 'Manage visitors' },
      { value: PERMISSIONS.CanManageAccess,       label: 'Manage passes & blacklist' },
    ],
  },
  {
    label: 'Dashboard & Reports',
    icon: 'material-symbols:bar-chart-4-bars-rounded',
    permissions: [
      { value: PERMISSIONS.CanViewDashboard,  label: 'View dashboard' },
      { value: PERMISSIONS.CanViewReports,    label: 'View reports' },
      { value: PERMISSIONS.CanManageAuditLog, label: 'View audit log' },
    ],
  },
  {
    label: 'Administration',
    icon: 'material-symbols:admin-panel-settings-outline-rounded',
    permissions: [
      { value: PERMISSIONS.CanManageUsers,      label: 'Manage users' },
      { value: PERMISSIONS.CanManageUnits,      label: 'Manage units' },
      { value: PERMISSIONS.CanManageSettings,   label: 'Manage settings' },
      { value: PERMISSIONS.CanManageFacilities, label: 'Manage facilities' },
      { value: PERMISSIONS.CanManageEntrances,  label: 'Manage entrances' },
    ],
  },
  {
    label: 'Operations',
    icon: 'material-symbols:settings-outline-rounded',
    permissions: [
      { value: PERMISSIONS.CanLogIncidents,      label: 'Log incidents' },
      { value: PERMISSIONS.CanManageIncidents,   label: 'Manage incidents' },
      { value: PERMISSIONS.CanAccessParking,     label: 'Access parking' },
      { value: PERMISSIONS.CanManageParking,     label: 'Manage parking tags' },
      { value: PERMISSIONS.CanManageParcels,     label: 'Manage parcels' },
      { value: PERMISSIONS.CanManageMaintenance, label: 'Manage maintenance' },
      { value: PERMISSIONS.CanManagePayments,    label: 'Manage payments' },
    ],
  },
  {
    label: 'Communication',
    icon: 'material-symbols:campaign-outline-rounded',
    permissions: [
      { value: PERMISSIONS.CanManageDocuments,     label: 'Manage documents' },
      { value: PERMISSIONS.CanManageAnnouncements, label: 'Manage announcements' },
    ],
  },
  {
    label: 'Human Resources',
    icon: 'material-symbols:badge-outline-rounded',
    permissions: [
      { value: PERMISSIONS.CanManageHr, label: 'Manage HR & staff' },
    ],
  },
];

// ── Hooks ──────────────────────────────────────────────────────────────────────

export const useGetRoles = () =>
  useSWR<AppRoleItem[]>('/superadmin/roles', axiosFetcher);

export const useGetPermissionDefs = () =>
  useSWR<PermissionDef[]>('/superadmin/roles/permissions/all', axiosFetcher);

export const useCreateRole = () =>
  useSWRMutation(
    '/superadmin/roles',
    (_url: string, { arg }: { arg: CreateRolePayload }) =>
      axiosInstance.post('/superadmin/roles', arg),
  );

export const useUpdateRolePermissions = (id: string) =>
  useSWRMutation(
    `/superadmin/roles/${id}/permissions`,
    (url: string, { arg }: { arg: { permissions: number[] } }) =>
      axiosInstance.put(url, arg),
  );

export const useUpdateRole = (id: string) =>
  useSWRMutation(
    `/superadmin/roles/${id}`,
    (url: string, { arg }: { arg: UpdateRolePayload }) =>
      axiosInstance.patch(url, arg),
  );

export const useToggleRole = (id: string) =>
  useSWRMutation(
    `/superadmin/roles/${id}/toggle`,
    (url: string) => axiosInstance.patch(url),
  );

export const useDeleteRole = (id: string) =>
  useSWRMutation(
    `/superadmin/roles/${id}`,
    (url: string) => axiosInstance.delete(url),
  );
