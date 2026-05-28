'use client';

import type { ReactNode } from 'react';
import MainLayout from 'layouts/main-layout';
import SitemapProvider from 'providers/SitemapProvider';
import superadminSitemap from 'routes/superadmin-sitemap';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SitemapProvider items={superadminSitemap}>
      <MainLayout>{children}</MainLayout>
    </SitemapProvider>
  );
}
