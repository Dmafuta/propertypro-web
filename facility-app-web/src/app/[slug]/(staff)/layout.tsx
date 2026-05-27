import type { ReactNode } from 'react';
import MainLayout from 'layouts/main-layout';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
