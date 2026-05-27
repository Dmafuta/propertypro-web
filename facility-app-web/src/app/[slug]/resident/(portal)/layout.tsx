import type { ReactNode } from "react";
import ResidentLayout from "layouts/resident-layout";

export default function ResidentPortalLayout({ children }: { children: ReactNode }) {
  return <ResidentLayout>{children}</ResidentLayout>;
}
