'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface PaymentListDto {
  id: string;
  residentId: string | null;
  residentName: string | null;
  unitNumber: string | null;
  amount: number;
  currency: string;
  method: string;
  status: string;
  purpose: string;
  phoneNumber: string | null;
  mpesaReceiptNo: string | null;
  reference: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface PaymentsPageResponse {
  items: PaymentListDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InitiateMpesaPayload {
  phone: string;
  amount: number;
  residentId?: string | null;
  unitId?: string | null;
  purpose: number;
  reference?: string | null;
}

export interface RecordManualPayload {
  residentId?: string | null;
  unitId?: string | null;
  amount: number;
  method: number;
  purpose: number;
  reference?: string | null;
  notes?: string | null;
}

// ── Payment enum maps ─────────────────────────────────────────────────────────

export const PaymentMethodLabel: Record<string, string> = {
  Mpesa: 'M-Pesa', Cash: 'Cash', BankTransfer: 'Bank Transfer', Card: 'Card',
};

export const PaymentPurposeLabel: Record<string, string> = {
  Rent: 'Rent', Levy: 'Levy', Deposit: 'Deposit',
  Utility: 'Utility', Facility: 'Facility', Other: 'Other',
};

export const PAYMENT_PURPOSE_OPTIONS = [
  { value: 0, label: 'Rent' },
  { value: 1, label: 'Levy' },
  { value: 2, label: 'Deposit' },
  { value: 3, label: 'Utility' },
  { value: 4, label: 'Facility' },
  { value: 5, label: 'Other' },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: 0, label: 'M-Pesa' },
  { value: 1, label: 'Cash' },
  { value: 2, label: 'Bank Transfer' },
  { value: 3, label: 'Card' },
];

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useGetPayments = (page = 1, pageSize = 25, status?: number) => {
  const qs = status !== undefined ? `&status=${status}` : '';
  return useSWR<PaymentsPageResponse>(
    `/payments?page=${page}&pageSize=${pageSize}${qs}`,
    axiosFetcher,
  );
};

export const useInitiateMpesa = () =>
  useSWRMutation(
    '/payments/mpesa/stk-push',
    (_url: string, { arg }: { arg: InitiateMpesaPayload }) =>
      axiosInstance.post<{ paymentId: string; checkoutId: string; message: string }>(
        '/payments/mpesa/stk-push', arg,
      ),
  );

export const useRecordManual = () =>
  useSWRMutation(
    '/payments/manual',
    (_url: string, { arg }: { arg: RecordManualPayload }) =>
      axiosInstance.post<{ id: string }>('/payments/manual', arg),
  );
