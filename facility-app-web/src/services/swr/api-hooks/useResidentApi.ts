"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import axiosFetcher from "services/axios/axiosFetcher";

// ── Dashboard ──────────────────────────────────────────────────────────────

export interface ResidentUpcomingVisit {
  id: string;
  visitorName: string;
  purpose: string;
  scheduledAt: string;
}

export interface ResidentDashboardStats {
  upcomingVisits: number;
  activeVisits: number;
  totalVisits: number;
  pendingParcels: number;
  openMaintenance: number;
  hasUnit: boolean;
  unitNumber: string | null;
  pendingUnitRequest: boolean;
  upcomingVisitsList: ResidentUpcomingVisit[];
}

export const useResidentDashboard = () =>
  useSWR<ResidentDashboardStats>("/resident/dashboard", axiosFetcher, {
    revalidateOnMount: true,
    refreshInterval: 30000,
  });

// ── Visits ─────────────────────────────────────────────────────────────────

export type VisitStatus = "Scheduled" | "Active" | "Completed" | "Cancelled" | "NoShow";

export interface ResidentVisit {
  id: string;
  visitorName: string;
  visitorPhone: string | null;
  purpose: string;
  status: VisitStatus;
  scheduledAt: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  qrCode: string | null;
}

export const useResidentVisits = (status?: VisitStatus) =>
  useSWR<ResidentVisit[]>(
    status ? ["/resident/visits", { params: { status } }] : "/resident/visits",
    axiosFetcher,
    { revalidateOnMount: true },
  );

// ── Pre-register ───────────────────────────────────────────────────────────

export interface PreRegisterInput {
  visitorName: string;
  visitorPhone: string;
  visitorEmail?: string;
  purpose: string;
  scheduledAt: string;
}

export const usePreRegister = () =>
  useSWRMutation("/resident/visits/pre-register", (url: string, { arg }: { arg: PreRegisterInput }) =>
    axiosFetcher([url, { method: "post" }], { arg }),
  );

// ── Maintenance ────────────────────────────────────────────────────────────

export type MaintenanceStatus = "Open" | "InProgress" | "Resolved" | "Closed";
export type MaintenancePriority = "Low" | "Medium" | "High" | "Urgent";
export type MaintenanceCategory =
  | "Plumbing"
  | "Electrical"
  | "HVAC"
  | "Structural"
  | "Appliance"
  | "Pest"
  | "Cleaning"
  | "Other";

export interface ResidentMaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  staffNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceInput {
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
}

export const useResidentMaintenance = () =>
  useSWR<ResidentMaintenanceRequest[]>("/resident/maintenance", axiosFetcher, {
    revalidateOnMount: true,
  });

export const useSubmitMaintenance = () =>
  useSWRMutation("/resident/maintenance", (url: string, { arg }: { arg: MaintenanceInput }) =>
    axiosFetcher([url, { method: "post" }], { arg }),
  );

// ── Parcels ────────────────────────────────────────────────────────────────

export type ParcelStatus = "Pending" | "Collected" | "Returned";

export interface ResidentParcel {
  id: string;
  description: string;
  courier: string | null;
  status: ParcelStatus;
  receivedAt: string;
  collectedAt: string | null;
  collectedBy: string | null;
}

export const useResidentParcels = (status?: ParcelStatus) =>
  useSWR<ResidentParcel[]>(
    status ? ["/resident/parcels", { params: { status } }] : "/resident/parcels",
    axiosFetcher,
    { revalidateOnMount: true },
  );

// ── Vehicles ───────────────────────────────────────────────────────────────

export interface ResidentVehicle {
  id: string;
  licensePlate: string;
  make: string | null;
  model: string | null;
  colour: string | null;
  tagNumber: string | null;
  tagStatus: "Active" | "Suspended" | "Revoked" | null;
}

export interface VehicleInput {
  licensePlate: string;
  make?: string;
  model?: string;
  colour?: string;
}

export const useResidentVehicles = () =>
  useSWR<ResidentVehicle[]>("/resident/vehicles", axiosFetcher, {
    revalidateOnMount: true,
  });

export const useRegisterVehicle = () =>
  useSWRMutation("/resident/vehicles", (url: string, { arg }: { arg: VehicleInput }) =>
    axiosFetcher([url, { method: "post" }], { arg }),
  );

// ── Documents ──────────────────────────────────────────────────────────────

export interface ResidentDocument {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  uploadedAt: string;
}

export const useResidentDocuments = () =>
  useSWR<ResidentDocument[]>("/documents", axiosFetcher, {
    revalidateOnMount: true,
  });

// ── Profile ────────────────────────────────────────────────────────────────

export interface ResidentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  unitNumber: string | null;
}

export interface ProfileUpdateInput {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export const useResidentProfile = () =>
  useSWR<ResidentProfile>("/resident/profile", axiosFetcher, {
    revalidateOnMount: true,
  });

export const useUpdateProfile = () =>
  useSWRMutation("/resident/profile", (url: string, { arg }: { arg: ProfileUpdateInput }) =>
    axiosFetcher([url, { method: "put" }], { arg }),
  );
