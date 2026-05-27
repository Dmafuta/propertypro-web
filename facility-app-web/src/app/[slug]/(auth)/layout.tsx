import type { ReactNode } from 'react';
import DefaultAuthLayout from 'layouts/auth-layout/DefaultAuthLayout';

export default function SlugAuthLayout({ children }: { children: ReactNode }) {
  return <DefaultAuthLayout>{children}</DefaultAuthLayout>;
}
