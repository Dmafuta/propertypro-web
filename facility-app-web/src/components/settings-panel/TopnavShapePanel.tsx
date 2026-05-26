'use client';

import { ChangeEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FormControlLabel, Radio } from '@mui/material';
import { TopnavType } from 'config';
import { useSettingsPanelContext } from 'providers/SettingsPanelProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import SettingsItem from './SettingsItem';
import SettingsPanelRadioGroup from './SettingsPanelRadioGroup';
import { TopnavDefaultIllustration } from './panel-illustrations/TopnavDefaultIllustration';
import { TopnavSlimIllustration } from './panel-illustrations/TopnavSlimIllustration';
import { TopnavStackedIllustration } from './panel-illustrations/TopnavStackedIllustration';

const TopnavShapePanel = () => {
  const {
    config: { topnavType },
    setConfig,
  } = useSettingsContext();
  const router = useRouter();
  const pathname = usePathname();

  const {
    settingsPanelConfig: { disableTopShapeSection },
  } = useSettingsPanelContext();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    router.replace(pathname);
    const value = (event.target as HTMLInputElement).value as TopnavType;
    setConfig({
      topnavType: value,
    });
  };

  return (
    <SettingsPanelRadioGroup name="sidenav-shape" value={topnavType} onChange={handleChange}>
      <FormControlLabel
        value="default"
        control={<Radio />}
        label={
          <SettingsItem
            label="Default"
            image={<TopnavDefaultIllustration active={topnavType === 'default'} />}
            active={!disableTopShapeSection && topnavType === 'default'}
          />
        }
      />
      <FormControlLabel
        value="slim"
        control={<Radio />}
        label={
          <SettingsItem
            label="Slim"
            image={<TopnavSlimIllustration active={topnavType === 'slim'} />}
            active={!disableTopShapeSection && topnavType === 'slim'}
          />
        }
      />
      <FormControlLabel
        value="stacked"
        control={<Radio />}
        label={
          <SettingsItem
            label="Stacked"
            image={<TopnavStackedIllustration active={topnavType === 'stacked'} />}
            active={!disableTopShapeSection && topnavType === 'stacked'}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default TopnavShapePanel;
