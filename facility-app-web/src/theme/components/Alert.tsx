import { alertClasses, AlertColor, PaletteColor, Theme } from '@mui/material';
import { AlertOwnerState } from '@mui/material/Alert';
import { Components } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';

type AlertVariantStyleArg = AlertOwnerState & { theme: Theme };

declare module '@mui/material/Alert' {
  interface AlertPropsColorOverrides {
    neutral: true;
    primary: true;
  }
}

const Alert: Components<Omit<Theme, 'components'>>['MuiAlert'] = {
  defaultProps: {
    iconMapping: {
      error: <IconifyIcon icon="material-symbols:error-outline-rounded" />,
      success: <IconifyIcon icon="material-symbols:check-circle-outline-rounded" />,
      warning: <IconifyIcon icon="material-symbols:warning-outline-rounded" />,
      info: <IconifyIcon icon="material-symbols:info-outline-rounded" />,
      primary: <IconifyIcon icon="material-symbols:notifications-outline-rounded" />,
      neutral: <IconifyIcon icon="material-symbols:help-outline-rounded" />,
    },
  },
  styleOverrides: {
    root: ({ theme }) => ({
      variants: [
        {
          props: { variant: 'standard' },
          style: ({ severity, color, theme }: AlertVariantStyleArg) => {
            const paletteColor = theme.vars.palette[
              (color || severity) as AlertColor
            ] as PaletteColor;

            return {
              backgroundColor: paletteColor.lighter,
              color: paletteColor.darker,
              [`& .${alertClasses.icon}`]: {
                color: paletteColor.main,
              },
            };
          },
        },
        {
          props: { variant: 'filled' },
          style: ({ severity, color, theme }: AlertVariantStyleArg) => {
            const paletteColor = theme.vars.palette[
              (color || severity) as AlertColor
            ] as PaletteColor;

            return {
              backgroundColor: paletteColor.main,
              color: paletteColor.contrastText,
              [`& .${alertClasses.icon}`]: {
                color: paletteColor.contrastText,
              },
            };
          },
        },
        {
          props: { variant: 'outlined' },
          style: ({ severity, color, theme }: AlertVariantStyleArg) => {
            const paletteColor = theme.vars.palette[
              (color || severity) as AlertColor
            ] as PaletteColor;

            return {
              borderColor: paletteColor.main,
              color: paletteColor.main,
              [`& .${alertClasses.icon}`]: {
                color: paletteColor.main,
              },
            };
          },
        },
      ],
      borderRadius: (theme.shape.borderRadius as number) * 2,
      outline: 0,
    }),
    message: () => ({
      fontSize: '1rem',
      fontWeight: 500,
    }),
    icon: ({ theme }) => ({
      marginTop: theme.spacing(0.35),
    }),
  },
};

export default Alert;
