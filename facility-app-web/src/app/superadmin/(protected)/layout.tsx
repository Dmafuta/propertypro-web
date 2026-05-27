import type { ReactNode } from "react";
import SuperAdminLayout from "layouts/superadmin-layout";

export default function SuperAdminProtectedLayout({ children }: { children: ReactNode }) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
