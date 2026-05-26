import { Color } from '@mui/material';
import { ThemePreset } from 'config';
import { generatePaletteChannel } from 'lib/utils';
import {
  arcticPrimary,
  draculaPrimary,
  emberPrimary,
  luxuryPrimary,
  midnightPrimary,
  naturePrimary,
  primaryRetro,
} from 'theme/colors';
import { blue, green } from 'theme/colors/base';

export const THEME_PRIMARY_PALETTES = {
  'default-light': blue,
  midnight: midnightPrimary,
  dracula: draculaPrimary,
  ember: emberPrimary,
  luxury: luxuryPrimary,
  nature: naturePrimary,
  arctic: arcticPrimary,
  retro: primaryRetro,
} as const;

export const getThemePrimaryColors = (themePreset?: ThemePreset | null) => {
  return THEME_PRIMARY_PALETTES[themePreset as keyof typeof THEME_PRIMARY_PALETTES] || blue;
};

export const isBlueTheme = (themePreset?: ThemePreset | null): boolean => {
  return themePreset === 'midnight' || themePreset === 'dracula' || themePreset === 'ember';
};

export const getBlueThemePrimaryPalette = (
  themePreset?: ThemePreset | null,
): Record<string, string> | null => {
  if (!isBlueTheme(themePreset)) return null;
  return getThemePrimaryColors(themePreset);
};

const darkAccentGreen = generatePaletteChannel(green);

export const getDarkModeAccentPalette = (
  accentPalette: Color,
  isDark: boolean,
  themePreset?: ThemePreset | null,
) => {
  if (!isDark) return accentPalette;

  if (isBlueTheme(themePreset)) {
    return getThemePrimaryColors(themePreset);
  }

  return darkAccentGreen;
};
