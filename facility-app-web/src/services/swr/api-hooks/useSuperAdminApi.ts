"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import axiosFetcher from "services/axios/axiosFetcher";
import axiosInstance from "services/axios/axiosInstance";

export interface TenantItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  plan: number; // 0 = Starter, 1 = Professional
  customDomain: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  website: string | null;
  primaryColour: string | null;
  logoUrl: string | null;
  createdAt: string;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  contactEmail: string;
}

export const useListTenants = () =>
  useSWR<TenantItem[]>("/superadmin/tenants", axiosFetcher, { revalidateOnMount: true });

export const useCreateTenant = () =>
  useSWRMutation(
    "/superadmin/tenants",
    (_url: string, { arg }: { arg: CreateTenantPayload }) =>
      axiosInstance.post("/superadmin/tenants", arg)
  );

export const useToggleTenant = (id: string) =>
  useSWRMutation(
    `/superadmin/tenants/${id}/toggle`,
    (url: string) => axiosInstance.patch(url)
  );

export const useUpdateTenantPlan = (id: string) =>
  useSWRMutation(
    `/superadmin/tenants/${id}/plan`,
    (url: string, { arg }: { arg: { plan: number } }) =>
      axiosInstance.patch(url, arg)
  );
