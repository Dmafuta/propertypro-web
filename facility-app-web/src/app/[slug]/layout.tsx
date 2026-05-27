import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { TenantProvider, type TenantInfo } from 'providers/TenantProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5055';

async function fetchTenant(slug: string): Promise<TenantInfo | null> {
  try {
    const res = await fetch(`${API_URL}/api/tenant`, {
      headers: { 'X-Tenant-Slug': slug },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as TenantInfo;
  } catch {
    return null;
  }
}

export default async function SlugLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}) {
  const { slug } = await params;

  // Detect if this request arrived via a custom-domain rewrite from middleware
  const reqHeaders = await headers();
  const isCustomDomain = reqHeaders.get('x-is-custom-domain') === 'true';

  const tenant = await fetchTenant(slug);
  if (!tenant) notFound();

  return (
    <TenantProvider tenant={{ ...tenant, isCustomDomain }}>
      {children}
    </TenantProvider>
  );
}
