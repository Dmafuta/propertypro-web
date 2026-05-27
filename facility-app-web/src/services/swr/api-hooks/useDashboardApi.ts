'use client';

import useSWR from 'swr';
import axiosFetcher from 'services/axios/axiosFetcher';

export interface UpcomingVisit {
  id: string;
  purpose: string;
  scheduledAt: string;
  visitorName: string;
  hostName: string | null;
}

export interface DashboardStats {
  totalUnits: number;
  occupiedUnits: number;
  todayVisits: number;
  activeVisits: number;
  openMaintenance: number;
  pendingParcels: number;
  openIncidents: number;
  pendingUnitRequests: number;
  activeVehicles: number;
  upcomingVisits: UpcomingVisit[];
}

export const useGetDashboard = () =>
  useSWR<DashboardStats>('/dashboard', axiosFetcher, {
    revalidateOnMount: true,
    refreshInterval: 30000,
  });
