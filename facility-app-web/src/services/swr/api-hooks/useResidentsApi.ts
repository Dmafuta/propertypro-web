'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface ResidentListItemDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  userType: string;
  units: string[];
  nationalId: string | null;
  createdAt: string;
}

export interface ResidentListResponse {
  total: number;
  page: number;
  pageSize: number;
  items: ResidentListItemDto[];
}

export interface ResidentUnitLinkDto {
  userUnitId: string;
  unitId: string;
  unitNumber: string;
  block: string | null;
  linkType: string;
  moveInDate: string | null;
  moveOutDate: string | null;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  monthlyRent: number | null;
  depositAmount: number | null;
  depositPaid: boolean | null;
  employerName: string | null;
  employerPhone: string | null;
  guarantorName: string | null;
  guarantorIdNumber: string | null;
  guarantorPhone: string | null;
  rentalAgreementRef: string | null;
}

export interface ResidentProfileDataDto {
  nationalId: string | null;
  passportNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  physicalAddress: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  nextOfKinName: string | null;
  nextOfKinPhone: string | null;
  nextOfKinRelationship: string | null;
}

export interface OwnerProfileDataDto {
  kraPin: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankBranch: string | null;
  levyPaymentMethod: string | null;
  titleDeedRef: string | null;
  isAbsenteeOwner: boolean;
  managingAgentName: string | null;
  managingAgentContact: string | null;
}

export interface ResidentVehicleSummaryDto {
  id: string;
  plate: string;
  make: string;
  model: string;
  colour: string;
  vehicleType: string;
  tagNumber: string | null;
  tagStatus: string | null;
}

export interface ResidentDetailDto {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  userType: string;
  createdAt: string;
  residentProfile: ResidentProfileDataDto | null;
  ownerProfile: OwnerProfileDataDto | null;
  units: ResidentUnitLinkDto[];
  vehicles: ResidentVehicleSummaryDto[];
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateResidentPayload {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  userType: number; // 1 = HomeOwner, 2 = Resident
  password: string;
}

export interface UpsertResidentProfilePayload {
  nationalId?: string | null;
  passportNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  physicalAddress?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  nextOfKinName?: string | null;
  nextOfKinPhone?: string | null;
  nextOfKinRelationship?: string | null;
}

export interface UpsertOwnerProfilePayload {
  kraPin?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankBranch?: string | null;
  levyPaymentMethod?: string | null;
  titleDeedRef?: string | null;
  isAbsenteeOwner: boolean;
  managingAgentName?: string | null;
  managingAgentContact?: string | null;
}

export interface UpdateTenancyPayload {
  leaseStartDate?: string | null;
  leaseEndDate?: string | null;
  monthlyRent?: number | null;
  depositAmount?: number | null;
  depositPaid?: boolean | null;
  employerName?: string | null;
  employerPhone?: string | null;
  guarantorName?: string | null;
  guarantorIdNumber?: string | null;
  guarantorPhone?: string | null;
  rentalAgreementRef?: string | null;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useGetResidents = (page: number, pageSize = 50) =>
  useSWR<ResidentListResponse>(
    `/residents?page=${page}&pageSize=${pageSize}`,
    axiosFetcher,
  );

export const useSearchResidents = (q: string) =>
  useSWR<ResidentListItemDto[]>(
    q.trim() ? `/residents/search?q=${encodeURIComponent(q.trim())}` : null,
    axiosFetcher,
  );

export const useGetResident = (id: string | null) =>
  useSWR<ResidentDetailDto>(id ? `/residents/${id}` : null, axiosFetcher);

export const useCreateResident = () =>
  useSWRMutation('/residents', (_url: string, { arg }: { arg: CreateResidentPayload }) =>
    axiosInstance.post('/residents', arg).then((r) => r.data));

export const useUpsertResidentProfile = (id: string) =>
  useSWRMutation(
    `/residents/${id}/profile`,
    (_url: string, { arg }: { arg: UpsertResidentProfilePayload }) =>
      axiosInstance.put(`/residents/${id}/profile`, arg),
  );

export const useUpsertOwnerProfile = (id: string) =>
  useSWRMutation(
    `/residents/${id}/owner-profile`,
    (_url: string, { arg }: { arg: UpsertOwnerProfilePayload }) =>
      axiosInstance.put(`/residents/${id}/owner-profile`, arg),
  );

export const useUpdateTenancy = (userUnitId: string) =>
  useSWRMutation(
    `/residents/user-units/${userUnitId}/tenancy`,
    (_url: string, { arg }: { arg: UpdateTenancyPayload }) =>
      axiosInstance.patch(`/residents/user-units/${userUnitId}/tenancy`, arg),
  );
