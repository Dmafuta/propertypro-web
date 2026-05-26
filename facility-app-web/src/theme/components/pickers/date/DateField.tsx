import type { ComponentsProps, Theme } from '@mui/material/styles';
import { Components } from '@mui/material/styles';
import { type DateFieldProps } from '@mui/x-date-pickers';

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    MuiDateField: Partial<DateFieldProps>;
  }

  interface Components {
    MuiDateField?: {
      defaultProps?: ComponentsProps['MuiDateField'];
    };
  }
}

const DateField: Components<Omit<Theme, 'components'>>['MuiDateField'] = {
  defaultProps: {},
};

export default DateField;
