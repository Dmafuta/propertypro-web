'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { setTenantSlug } from 'services/axios/tenantSlug';

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  plan: 'Starter' | 'Professional';
  logoUrl: string | null;
  primaryColour: string | null;
  isCustomDomain: boolean;
}

const TenantContext = createContext<TenantInfo | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantInfo;
  children: ReactNode;
}) {
  // Keep the axios slug module in sync with the current tenant
  useEffect(() => {
    setTenantSlug(tenant.slug);
    return () => setTenantSlug('');
  }, [tenant.slug]);

  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantInfo {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}

export function useTenantSafe(): TenantInfo | null {
  return useContext(TenantContext);
}
