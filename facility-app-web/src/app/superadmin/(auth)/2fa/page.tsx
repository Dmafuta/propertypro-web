import type { Metadata } from 'next';
import SuperAdmin2FAForm from 'components/sections/authentications/facility/SuperAdmin2FAForm';

export const metadata: Metadata = { title: 'Two-Factor Verification | Platform Admin' };

export default function SuperAdmin2FAPage() {
  return <SuperAdmin2FAForm />;
}
