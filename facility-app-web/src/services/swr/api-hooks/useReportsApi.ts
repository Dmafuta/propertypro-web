'use client';

import useSWR from 'swr';
import axiosFetcher from 'services/axios/axiosFetcher';

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface DailyCount {
  date: string;
  total: number;
  checkedIn: number;
  noShow: number;
}

export interface HourlyCount {
  hour: number;
  count: number;
}

export interface VisitorFrequency {
  fullName: string;
  email: string;
  visits: number;
}

export interface ReportStats {
  totalVisits: number;
  totalCheckedIn: number;
  totalCheckedOut: number;
  totalScheduled: number;
  totalCancelled: number;
  totalNoShow: number;
  checkInRate: number;
  avgPerDay: number;
  dailyBreakdown: DailyCount[];
  hourlyBreakdown: HourlyCount[];
  topVisitors: VisitorFrequency[];
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetReportStats = (from: string, to: string) =>
  useSWR<ReportStats>(
    from && to ? `/reports/stats?from=${from}&to=${to}` : null,
    axiosFetcher,
  );

/** Returns the URL to trigger a CSV download (uses token in Authorization header via axiosInstance) */
export const getExportUrl = (from: string, to: string) =>
  `/reports/export?from=${from}&to=${to}`;
