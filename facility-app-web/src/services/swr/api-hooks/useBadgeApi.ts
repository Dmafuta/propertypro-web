'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';
import axios from 'axios';

export interface BadgeDto {
  visitId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  company: string | null;
  photoUrl: string | null;
  purpose: string;
  hostName: string | null;
  scheduledAt: string;
  checkedInAt: string | null;
  /** 0=Scheduled 1=CheckedIn 2=CheckedOut 3=Cancelled 4=NoShow */
  status: number;
  entryEntrance: string | null;
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantPrimaryColour: string | null;
}

// Authenticated: get visit badge data for staff badge page
export const useGetVisitBadge = (visitId: string | null) =>
  useSWR<BadgeDto>(visitId ? `/visitors/visits/${visitId}` : null, axiosFetcher);

// Authenticated: send badge email
export const useSendBadge = () =>
  useSWRMutation(
    '/visitors/send-badge',
    (_url: string, { arg }: { arg: { visitId: string; customEmail?: string | null } }) =>
      axiosInstance.post(`/visitors/visits/${arg.visitId}/send-badge`, {
        customEmail: arg.customEmail ?? null,
      }),
  );

// Public (no auth): fetch badge data for shareable page
export const getPublicBadge = async (visitId: string): Promise<BadgeDto | null> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5055';
  try {
    const res = await axios.get<BadgeDto>(`${apiUrl}/api/badge/${visitId}`);
    return res.data;
  } catch {
    return null;
  }
};
