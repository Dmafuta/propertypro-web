import type { ReactNode } from 'react';
import DefaultAuthLayout from 'layouts/auth-layout/DefaultAuthLayout';

export default function SuperAdminAuthLayout({ children }: { children: ReactNode }) {
  return <DefaultAuthLayout>{children}</DefaultAuthLayout>;
}
