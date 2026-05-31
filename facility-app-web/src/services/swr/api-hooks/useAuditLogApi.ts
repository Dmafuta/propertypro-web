'use client';

import useSWR from 'swr';
import axiosFetcher from 'services/axios/axiosFetcher';

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface AuditLogDto {
  id: number;
  userId: string | null;
  userName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

export interface AuditLogResponse {
  items: AuditLogDto[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetAuditLog = (search: string, page: number, pageSize = 50) =>
  useSWR<AuditLogResponse>(
    `/audit-log?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`,
    axiosFetcher,
  );
