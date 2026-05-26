import { getSession } from 'next-auth/react';
import axios from 'axios';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5055') + '/api';
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? '';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    ...(TENANT_SLUG && { 'X-Tenant-Slug': TENANT_SLUG }),
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
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
