'use client';

import { PropsWithChildren, useEffect, useRef } from 'react';
import useSettingsPanelMountEffect from 'hooks/useSettingsPanelMountEffect';
import { useThemeMode } from 'hooks/useThemeMode';
import { useSettingsContext } from 'providers/SettingsProvider';
import { mutate } from 'swr';
import LandingAppBar from './app-bar';
import LandingFooter from './footer';

const LandingLayout = ({ children }: PropsWithChildren) => {
  const {
    config: { navColor },
    setConfig,
  } = useSettingsContext();

  const { themePreset, setThemePreset } = useThemeMode();

  const navColorRef = useRef(navColor);
  const themePresetRef = useRef(themePreset);

  useSettingsPanelMountEffect({
    disableNavigationMenuSection: true,
    disableSidenavShapeSection: true,
    disableTopShapeSection: true,
  });

  useEffect(() => {
    setConfig({ navColor: 'default' });
    setThemePreset('luxury');

    return () => {
      setConfig({ navColor: navColorRef.current });
      setThemePreset(themePresetRef.current);
      mutate((key: unknown) => Array.isArray(key) && key[0].startsWith('e-commerce'), undefined, {
        revalidate: true,
      });
    };
  }, []);

  return (
    <div>
      <LandingAppBar />
      {children}
      <LandingFooter />
    </div>
  );
};

export default LandingLayout;
