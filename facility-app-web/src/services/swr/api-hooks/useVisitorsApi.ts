'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export interface VisitorDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string | null;
  photoUrl: string | null;
}

export interface VisitHostDto {
  id: string;
  fullName: string;
  email: string;
}

export interface VisitDto {
  id: string;
  visitor: VisitorDto;
  hostUserId: string | null;
  host: VisitHostDto | null;
  purpose: string;
  scheduledAt: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  /** 0=Scheduled 1=CheckedIn 2=CheckedOut 3=Cancelled 4=NoShow */
  status: number;
  notes: string | null;
  entryEntrance: { id: string; name: string } | null;
  exitEntrance:  { id: string; name: string } | null;
  createdAt: string;
}

export interface VisitsResponse {
  items: VisitDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WalkInPayload {
  fullName: string;
  email: string;
  phone: string;
  company?: string | null;
  purpose: string;
  hostUserId?: string | null;
  notes?: string | null;
  entranceId?: string | null;
}

export interface PreRegisterPayload extends WalkInPayload {
  scheduledAt: string;
}

// ── Read ──────────────────────────────────────────────────────────────────────

export const useGetVisits = (tab: string, search: string, page: number) =>
  useSWR<VisitsResponse>(
    `/visitors/visits?tab=${encodeURIComponent(tab)}&search=${encodeURIComponent(search)}&page=${page}&pageSize=25`,
    axiosFetcher,
  );

export const useGetHosts = () =>
  useSWR<VisitHostDto[]>('/visitors/hosts', axiosFetcher);

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useWalkIn = () =>
  useSWRMutation(
    '/visitors/walk-in',
    (_url: string, { arg }: { arg: WalkInPayload }) =>
      axiosInstance.post('/visitors/walk-in', arg),
  );

export const usePreRegister = () =>
  useSWRMutation(
    '/visitors/pre-register',
    (_url: string, { arg }: { arg: PreRegisterPayload }) =>
      axiosInstance.post('/visitors/pre-register', arg),
  );

export const useCheckIn = () =>
  useSWRMutation(
    '/visitors/check-in',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/visitors/visits/${arg}/check-in`, {}),
  );

export const useCheckOut = () =>
  useSWRMutation(
    '/visitors/check-out',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/visitors/visits/${arg}/check-out`, {}),
  );

export const useCancelVisit = () =>
  useSWRMutation(
    '/visitors/cancel',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/visitors/visits/${arg}/cancel`),
  );

export const useNoShow = () =>
  useSWRMutation(
    '/visitors/no-show',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/visitors/visits/${arg}/no-show`),
  );
