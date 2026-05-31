'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── Enums ─────────────────────────────────────────────────────────────────────
export const INCIDENT_CATEGORIES = [
  { value: 0, label: 'Security',    icon: 'material-symbols:security-rounded',                  color: 'error'   as const },
  { value: 1, label: 'Medical',     icon: 'material-symbols:medical-services-outline-rounded',  color: 'error'   as const },
  { value: 2, label: 'Fire',        icon: 'material-symbols:local-fire-department-outline-rounded', color: 'error' as const },
  { value: 3, label: 'Disturbance', icon: 'material-symbols:report-problem-outline-rounded',    color: 'warning' as const },
  { value: 4, label: 'Vandalism',   icon: 'material-symbols:broken-image-outline-rounded',      color: 'warning' as const },
  { value: 5, label: 'Maintenance', icon: 'material-symbols:build-outline-rounded',             color: 'info'    as const },
  { value: 6, label: 'Other',       icon: 'material-symbols:more-horiz-rounded',               color: 'neutral' as const },
];

export const INCIDENT_SEVERITIES = [
  { value: 0, label: 'Low',      color: 'success' as const },
  { value: 1, label: 'Medium',   color: 'warning' as const },
  { value: 2, label: 'High',     color: 'error'   as const },
  { value: 3, label: 'Critical', color: 'error'   as const },
];

export const INCIDENT_STATUSES = [
  { value: 0, label: 'Open',         color: 'error'   as const },
  { value: 1, label: 'Under Review', color: 'warning' as const },
  { value: 2, label: 'Resolved',     color: 'success' as const },
  { value: 3, label: 'Closed',       color: 'neutral' as const },
];

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface IncidentDto {
  id: string;
  title: string;
  description: string;
  location: string;
  involvedParties: string | null;
  /** 0=Security 1=Medical 2=Fire 3=Disturbance 4=Vandalism 5=Maintenance 6=Other */
  category: number;
  /** 0=Low 1=Medium 2=High 3=Critical */
  severity: number;
  /** 0=Open 1=UnderReview 2=Resolved 3=Closed */
  status: number;
  reportedBy: { id: string; fullName: string; email: string | null };
  reportedAt: string;
  resolvedBy: { id: string; fullName: string } | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  location: string;
  involvedParties?: string | null;
  category: number;
  severity: number;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetIncidents = () =>
  useSWR<IncidentDto[]>('/incidents', axiosFetcher);

export const useGetIncidentOpenCount = () =>
  useSWR<{ count: number }>('/incidents/open-count', axiosFetcher);

export const useCreateIncident = () =>
  useSWRMutation(
    '/incidents/create',
    (_url: string, { arg }: { arg: CreateIncidentPayload }) =>
      axiosInstance.post<IncidentDto>('/incidents', arg),
  );

export const useUpdateIncidentStatus = () =>
  useSWRMutation(
    '/incidents/update',
    (_url: string, { arg }: { arg: { id: string; status: number; resolutionNotes?: string | null } }) =>
      axiosInstance.patch(`/incidents/${arg.id}`, { status: arg.status, resolutionNotes: arg.resolutionNotes }),
  );

export const useDeleteIncident = () =>
  useSWRMutation(
    '/incidents/delete',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.delete(`/incidents/${arg}`),
  );
