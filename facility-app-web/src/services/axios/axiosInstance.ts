import { getSession } from 'next-auth/react';
import axios from 'axios';
import { getTenantSlug } from './tenantSlug';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5055') + '/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  // Inject tenant slug dynamically from TenantProvider (set via setTenantSlug)
  const slug = getTenantSlug();
  if (slug) {
    config.headers['X-Tenant-Slug'] = slug;
  }
  return config;
});

// Unwrap response envelope: return response.data directly
axiosInstance.interceptors.response.use((response) => response.data);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data || error.message,
    });
  },
);

export default axiosInstance;
