import { Suspense } from "react";
import FacilityResetPasswordForm from "components/sections/authentications/facility/FacilityResetPasswordForm";

export default async function StaffResetPasswordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Suspense><FacilityResetPasswordForm slug={slug} mode="staff" /></Suspense>;
}
