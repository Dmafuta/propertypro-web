'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── Enums ─────────────────────────────────────────────────────────────────────
export const UTILITY_TYPES = [
  { value: 0, label: 'Electricity', icon: 'material-symbols:electric-bolt-rounded' },
  { value: 1, label: 'Water', icon: 'material-symbols:water-drop-outline-rounded' },
  { value: 2, label: 'Sewerage', icon: 'material-symbols:plumbing-rounded' },
  { value: 3, label: 'Gas', icon: 'material-symbols:local-fire-department-outline-rounded' },
  { value: 4, label: 'Internet', icon: 'material-symbols:wifi-rounded' },
  { value: 5, label: 'Other', icon: 'material-symbols:settings-outline-rounded' },
];

export const METER_MODES = [
  { value: 0, label: 'Analogue / Postpaid', description: 'Staff reads monthly, billed after consumption' },
  { value: 1, label: 'Prepaid', description: 'Token/credit based — resident loads credit' },
  { value: 2, label: 'Smart Meter', description: 'IoT / automated remote reads' },
];

export const READING_TYPES = [
  { value: 0, label: 'Opening' },
  { value: 1, label: 'Manual Read' },
  { value: 2, label: 'Auto Read' },
  { value: 3, label: 'Estimated' },
  { value: 4, label: 'Closing' },
];

export const ALERT_TYPES = [
  { value: 0, label: 'Tamper' },
  { value: 1, label: 'High Consumption' },
  { value: 2, label: 'Low Credit' },
  { value: 3, label: 'Device Offline' },
  { value: 4, label: 'Leak Detected' },
  { value: 5, label: 'Other' },
];

export const ALERT_SEVERITIES = [
  { value: 0, label: 'Low', color: 'success' },
  { value: 1, label: 'Medium', color: 'warning' },
  { value: 2, label: 'High', color: 'error' },
  { value: 3, label: 'Critical', color: 'error' },
];

// ── DTOs ─────────────────────────────────────────────────────────────────────
export interface MeterDto {
  id: string;
  meterNumber: string;
  serialNumber: string | null;
  utilityType: string;
  utilityValue: number;
  meterMode: string;
  meterModeValue: number;
  location: string | null;
  unitOfMeasure: string | null;
  metadata: string | null;
  isActive: boolean;
  installDate: string;
  retiredAt: string | null;
  notes: string | null;
  previousMeterId: string | null;
  replacedByMeterId: string | null;
  latestReading: {
    readingValue: number;
    readingDate: string;
    readingType: string;
  } | null;
  readingCount: number;
}

export interface MeterReadingDto {
  id: string;
  readingValue: number;
  readingDate: string;
  readingType: string;
  readBy: string | null;
  photoUrl: string | null;
  notes: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface PrepaidTokenDto {
  id: string;
  tokenCode: string;
  amountPaid: number;
  unitsLoaded: number | null;
  purchasedAt: string;
  loadedAt: string | null;
  voucherReference: string | null;
  notes: string | null;
  purchasedBy: string | null;
  createdAt: string;
}

export interface MeterAlertDto {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  triggeredAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
}

export interface MeterInstallationReport {
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantAddress: string | null;
  tenantPhone: string | null;
  unitNumber: string;
  block: string | null;
  floor: string | null;
  unitTypeName: string | null;
  ownerName: string | null;
  occupantNames: string | null;
  meterId: string;
  meterNumber: string;
  serialNumber: string | null;
  utilityType: string;
  meterMode: string;
  location: string | null;
  unitOfMeasure: string | null;
  installDate: string;
  notes: string | null;
  metadata: string | null;
  openingReadingValue: number | null;
  openingReadingDate: string | null;
  openingReadingBy: string | null;
  reportRef: string;
  generatedAt: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useGetMeters = (unitId: string | null) =>
  useSWR<MeterDto[]>(unitId ? `/meters/unit/${unitId}` : null, axiosFetcher);

export const useGetMeter = (meterId: string | null) =>
  useSWR<MeterDto>(meterId ? `/meters/${meterId}` : null, axiosFetcher);

export const useGetMeterReadings = (meterId: string | null, page = 1) =>
  useSWR<MeterReadingDto[]>(meterId ? `/meters/${meterId}/readings?page=${page}&pageSize=20` : null, axiosFetcher);

export const useGetPrepaidTokens = (meterId: string | null, page = 1) =>
  useSWR<PrepaidTokenDto[]>(meterId ? `/meters/${meterId}/tokens?page=${page}&pageSize=20` : null, axiosFetcher);

export const useGetMeterAlerts = (meterId: string | null, unacknowledgedOnly = false) =>
  useSWR<MeterAlertDto[]>(
    meterId ? `/meters/${meterId}/alerts?unacknowledgedOnly=${unacknowledgedOnly}` : null,
    axiosFetcher,
  );

export const useGetInstallationReport = (meterId: string | null) =>
  useSWR<MeterInstallationReport>(meterId ? `/meters/${meterId}/report` : null, axiosFetcher);

export const useAddMeter = () =>
  useSWRMutation('/meters/add', (_url: string, { arg }: { arg: {
    unitId: string; utilityType: number; meterMode: number;
    meterNumber: string; serialNumber?: string | null; location?: string | null;
    unitOfMeasure?: string | null; metadata?: string | null; notes?: string | null;
    installDate: string;
  }}) => axiosInstance.post<{ id: string }>('/meters', arg));

export const useUpdateMeter = () =>
  useSWRMutation('/meters/update', (_url: string, { arg }: { arg: {
    id: string; meterNumber: string; serialNumber?: string | null;
    location?: string | null; unitOfMeasure?: string | null;
    metadata?: string | null; notes?: string | null;
  }}) => axiosInstance.put(`/meters/${arg.id}`, arg));

export const useRetireMeter = () =>
  useSWRMutation('/meters/retire', (_url: string, { arg }: { arg: {
    id: string; closingReadingValue: number; retiredAt: string; notes?: string | null;
  }}) => axiosInstance.post(`/meters/${arg.id}/retire`, {
    closingReadingValue: arg.closingReadingValue,
    retiredAt: arg.retiredAt,
    notes: arg.notes,
  }));

export const useAddReading = () =>
  useSWRMutation('/meters/readings/add', (_url: string, { arg }: { arg: {
    meterId: string; value: number; readingDate: string;
    readingType: number; photoUrl?: string | null; notes?: string | null;
  }}) => axiosInstance.post(`/meters/${arg.meterId}/readings`, {
    value: arg.value, readingDate: arg.readingDate,
    readingType: arg.readingType, photoUrl: arg.photoUrl, notes: arg.notes,
  }));

export const useAddToken = () =>
  useSWRMutation('/meters/tokens/add', (_url: string, { arg }: { arg: {
    meterId: string; tokenCode: string; amountPaid: number;
    unitsLoaded?: number | null; purchasedAt: string; loadedAt?: string | null;
    voucherReference?: string | null; notes?: string | null;
  }}) => axiosInstance.post(`/meters/${arg.meterId}/tokens`, arg));

export const useCreateMeterAlert = () =>
  useSWRMutation('/meters/alerts/create', (_url: string, { arg }: { arg: {
    meterId: string; alertType: number; severity: number;
    message: string; triggeredAt: string;
  }}) => axiosInstance.post(`/meters/${arg.meterId}/alerts`, {
    alertType: arg.alertType, severity: arg.severity,
    message: arg.message, triggeredAt: arg.triggeredAt,
  }));

export const useAcknowledgeAlert = () =>
  useSWRMutation('/meters/alerts/ack', (_url: string, { arg }: { arg: string }) =>
    axiosInstance.patch(`/meters/alerts/${arg}/acknowledge`));
