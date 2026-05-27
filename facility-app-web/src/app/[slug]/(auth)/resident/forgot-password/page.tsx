import { Suspense } from "react";
import FacilityForgotPasswordForm from "components/sections/authentications/facility/FacilityForgotPasswordForm";

export default async function ResidentForgotPasswordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Suspense><FacilityForgotPasswordForm slug={slug} mode="resident" /></Suspense>;
}
