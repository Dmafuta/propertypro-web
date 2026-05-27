import type { Metadata } from 'next';
import FacilityLoginForm from 'components/sections/authentications/facility/FacilityLoginForm';

export const metadata: Metadata = { title: 'Staff Login | FacilityApp' };

export default async function StaffLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FacilityLoginForm slug={slug} mode="staff" />;
}
