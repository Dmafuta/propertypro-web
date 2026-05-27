import type { Metadata } from 'next';
import FacilityLoginForm from 'components/sections/authentications/facility/FacilityLoginForm';

export const metadata: Metadata = { title: 'Platform Admin Login | FacilityApp' };

export default function SuperAdminLoginPage() {
  return <FacilityLoginForm slug="platform" mode="superadmin" />;
}
