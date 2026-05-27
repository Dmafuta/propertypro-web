/**
 * Module-level tenant slug store.
 * Set by TenantProvider on mount; read by axiosInstance request interceptor.
 * This avoids threading slug through every API call manually.
 */

let _slug = '';

export const setTenantSlug = (slug: string): void => {
  _slug = slug;
};

export const getTenantSlug = (): string => _slug;
