'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import axiosInstance from 'services/axios/axiosInstance';

export interface EmployeeProfileDto {
  middleName: string | null;
  nationalId: string | null;
  passportNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  joiningDate: string | null;
  contractType: string | null;
  department: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export interface HrStaffDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  roles: string[];
  department: string | null;
  contractType: string | null;
  joiningDate: string | null;
  isActive: boolean;
  createdAt: string;
  profile: EmployeeProfileDto | null;
}

export interface HrStaffResponse {
  items: HrStaffDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpsertProfilePayload {
  middleName?: string | null;
  nationalId?: string | null;
  passportNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  joiningDate?: string | null;
  contractType?: string | null;
  department?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

export const useGetHrStaff = (search: string, page: number) =>
  useSWR<HrStaffResponse>(
    `/hr/staff?search=${encodeURIComponent(search)}&page=${page}&pageSize=25`,
    axiosFetcher,
  );

export const useGetHrStaffMember = (userId: string | null) =>
  useSWR<HrStaffDto>(userId ? `/hr/staff/${userId}` : null, axiosFetcher);

export const useUpsertProfile = (userId: string) =>
  useSWRMutation(
    `/hr/staff/${userId}/profile`,
    (_url: string, { arg }: { arg: UpsertProfilePayload }) =>
      axiosInstance.put(`/hr/staff/${userId}/profile`, arg),
  );
