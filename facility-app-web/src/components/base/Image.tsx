'use client';

import NextImage, { ImageProps as NextImageProps, StaticImageData } from 'next/image';
import { styled, SxProps, Theme } from '@mui/material/styles';
import { useThemeMode } from 'hooks/useThemeMode';

export interface ThemeAwareImageSource {
  light: string | StaticImageData;
  dark: string | StaticImageData;
}

interface ThemeAwareImageProps extends Omit<NextImageProps, 'src' | 'alt'> {
  src: string | StaticImageData | ThemeAwareImageSource;
  alt?: string;
  sx?: SxProps<Theme>;
}

const StyledNextImage = styled(NextImage)({});

const Image = ({ src, alt = '', sx, ...props }: ThemeAwareImageProps) => {
  const { isDark } = useThemeMode();

  let imageSrc: string | StaticImageData;

  if (typeof src === 'string' || (src as StaticImageData)?.src) {
    imageSrc = src as string | StaticImageData;
  } else {
    const themedSrc = src as ThemeAwareImageSource;
    imageSrc = isDark ? themedSrc.dark : themedSrc.light;
  }

  return <StyledNextImage src={imageSrc} alt={alt} sx={sx} unoptimized={true} {...props} />;
};

export default Image;
