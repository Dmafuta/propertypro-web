'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export const BLACKLIST_TYPES = [
  { value: 0, label: 'Blacklisted', color: 'error' as const },
  { value: 1, label: 'Watchlisted', color: 'warning' as const },
];

export interface BlacklistEntryDto {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  reason: string;
  entryType: string;
  addedByName: string;
  addedAt: string;
  expiresAt: string | null;
  notes: string | null;
}

export interface BlacklistPageDto {
  total: number;
  page: number;
  pageSize: number;
  items: BlacklistEntryDto[];
}

export const useGetBlacklistEntries = (params: {
  search?: string; type?: string; page?: number; pageSize?: number;
}) => {
  const query = new URLSearchParams();
  if (params.search)   query.set('search', params.search);
  if (params.type)     query.set('type', params.type);
  if (params.page)     query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  return useSWR<BlacklistPageDto>(`/blacklist?${query}`, axiosFetcher);
};

export const useAddBlacklistEntry = () =>
  useSWRMutation('/blacklist/add', (_url: string, { arg }: { arg: {
    fullName: string; email?: string | null; phone?: string | null;
    reason: string; entryType: number;
    expiresAt?: string | null; notes?: string | null;
  }}) => axiosInstance.post<{ id: string }>('/blacklist', arg));

export const useRemoveBlacklistEntry = () =>
  useSWRMutation('/blacklist/remove', (_url: string, { arg }: { arg: string }) =>
    axiosInstance.delete(`/blacklist/${arg}`));
