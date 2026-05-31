'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── Enums ─────────────────────────────────────────────────────────────────────
export const ANNOUNCEMENT_CATEGORIES = [
  { value: 0, label: 'General',     color: 'info'    as const, icon: 'material-symbols:info-outline-rounded' },
  { value: 1, label: 'Maintenance', color: 'warning' as const, icon: 'material-symbols:build-outline-rounded' },
  { value: 2, label: 'Event',       color: 'success' as const, icon: 'material-symbols:event-outline-rounded' },
  { value: 3, label: 'Urgent',      color: 'error'   as const, icon: 'material-symbols:priority-high-rounded' },
];

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface AnnouncementDto {
  id: string;
  title: string;
  body: string;
  /** 0=General 1=Maintenance 2=Event 3=Urgent */
  category: number;
  isActive: boolean;
  publishedAt: string;
  expiresAt: string | null;
  createdBy: { id: string; fullName: string };
}

export interface CreateAnnouncementPayload {
  title: string;
  body: string;
  category: number;
  expiresAt?: string | null;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetAnnouncements = () =>
  useSWR<AnnouncementDto[]>('/announcements', axiosFetcher);

export const useCreateAnnouncement = () =>
  useSWRMutation(
    '/announcements/create',
    (_url: string, { arg }: { arg: CreateAnnouncementPayload }) =>
      axiosInstance.post<AnnouncementDto>('/announcements', arg),
  );

export const useToggleAnnouncement = () =>
  useSWRMutation(
    '/announcements/toggle',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/announcements/${arg}/toggle`, {}),
  );

export const useDeleteAnnouncement = () =>
  useSWRMutation(
    '/announcements/delete',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.delete(`/announcements/${arg}`),
  );
