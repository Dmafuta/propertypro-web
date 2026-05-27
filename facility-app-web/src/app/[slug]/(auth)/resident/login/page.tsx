import type { Metadata } from 'next';
import FacilityLoginForm from 'components/sections/authentications/facility/FacilityLoginForm';

export const metadata: Metadata = { title: 'Resident Login | FacilityApp' };

export default async function ResidentLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FacilityLoginForm slug={slug} mode="resident" />;
}
