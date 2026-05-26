import type { ComponentsOverrides, Theme } from '@mui/material/styles';
import { Components } from '@mui/material/styles';
import type { PickersTextFieldProps } from '@mui/x-date-pickers';

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey {
    MuiPickersTextField: 'root';
  }

  interface Components {
    MuiPickersTextField?: {
      defaultProps?: Partial<PickersTextFieldProps>;
      styleOverrides?: ComponentsOverrides<Theme>['MuiPickersTextField'];
    };
  }
}

const PickersTextField: Components<Omit<Theme, 'components'>>['MuiPickersTextField'] = {
  defaultProps: {
    variant: 'filled',
  },
  styleOverrides: {
    root: {
      minWidth: 0,
    },
  },
};

export default PickersTextField;
