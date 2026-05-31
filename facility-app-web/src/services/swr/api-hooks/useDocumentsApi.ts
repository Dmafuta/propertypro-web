'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── Enums ─────────────────────────────────────────────────────────────────────
export const DOCUMENT_CATEGORIES = [
  { value: 0, label: 'General',     icon: 'material-symbols:description-outline-rounded' },
  { value: 1, label: 'Rules',       icon: 'material-symbols:gavel-rounded' },
  { value: 2, label: 'Levy',        icon: 'material-symbols:receipt-long-outline-rounded' },
  { value: 3, label: 'Bylaws',      icon: 'material-symbols:policy-outline-rounded' },
  { value: 4, label: 'Notice',      icon: 'material-symbols:campaign-outline-rounded' },
  { value: 5, label: 'Other',       icon: 'material-symbols:folder-outline-rounded' },
];

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface AdminDocumentDto {
  id: string;
  title: string;
  description: string | null;
  category: string;
  originalFileName: string;
  fileSize: number;
  isActive: boolean;
  uploadedAt: string;
  fileUrl: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetDocuments = () =>
  useSWR<AdminDocumentDto[]>('/documents', axiosFetcher);

export const useUploadDocument = () =>
  useSWRMutation(
    '/documents/upload',
    (_url: string, { arg }: { arg: FormData }) =>
      axiosInstance.post<AdminDocumentDto>('/documents', arg, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  );

export const useToggleDocument = () =>
  useSWRMutation(
    '/documents/toggle',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.patch(`/documents/${arg}/toggle`, {}),
  );

export const useDeleteDocument = () =>
  useSWRMutation(
    '/documents/delete',
    (_url: string, { arg }: { arg: string }) =>
      axiosInstance.delete(`/documents/${arg}`),
  );
