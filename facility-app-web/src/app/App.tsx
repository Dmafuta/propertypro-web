'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SWRConfig } from 'swr';
import { useConfigFromQuery } from 'hooks/useConfigFromQuery';
import useTenantPrimaryColor from 'hooks/useTenantPrimaryColor';
import SettingsPanelProvider from 'providers/SettingsPanelProvider';

const App = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const pathname = usePathname();

  useConfigFromQuery();
  useTenantPrimaryColor();

  const isShowcase = pathname?.startsWith('/showcase') ?? false;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (isShowcase) {
      document.documentElement.style.overscrollBehavior = 'none';
      document.documentElement.style.filter = 'none';
    }

    return () => {
      document.documentElement.style.overscrollBehavior = 'auto';
      document.documentElement.style.filter = 'auto';
    };
  }, [pathname, isShowcase]);

  // useLayoutEffect(() => {
  //   configDispatch({ type: REFRESH });
  // }, [mode]);

  return (
    <SWRConfig value={{ revalidateOnFocus: false, dedupingInterval: 30_000 }}>
    <SettingsPanelProvider>
      {isShowcase && (
        <style>{`
          html[data-vision="protanopia"],
          html[data-vision="deuteranopia"],
          html[data-vision="tritanopia"],
          html[data-vision="achromatopsia"] {
            filter: none !important;
          }
        `}</style>
      )}
      {children}
    </SettingsPanelProvider>
    </SWRConfig>
  );
};

export default App;
