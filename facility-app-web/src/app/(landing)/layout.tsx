import { PropsWithChildren } from 'react';
import LandingLayout from 'layouts/landing-layout';

export default function LandingRootLayout({ children }: PropsWithChildren) {
  return <LandingLayout>{children}</LandingLayout>;
}
