import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from 'lib/next-auth/nextAuthOptions';
import MainLayout from 'layouts/main-layout';
import { RoleFilteredSitemapLayout } from 'layouts/RoleFilteredSitemapLayout';

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles ?? [];

  return (
    <RoleFilteredSitemapLayout roles={roles}>
      <MainLayout>{children}</MainLayout>
    </RoleFilteredSitemapLayout>
  );
}
