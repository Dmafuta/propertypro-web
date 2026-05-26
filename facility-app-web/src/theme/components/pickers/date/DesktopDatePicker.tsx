import { ButtonBase, Theme, inputBaseClasses } from '@mui/material';
import { Components } from '@mui/material/styles';
import { DesktopDatePickerProps } from '@mui/x-date-pickers';
import IconifyIcon from 'components/base/IconifyIcon';

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    MuiDesktopDatePicker: Partial<DesktopDatePickerProps>;
  }

  interface Components {
    MuiDesktopDatePicker?: {
      defaultProps?: Partial<DesktopDatePickerProps>;
    };
  }
}

const DesktopDatePicker: Components<Omit<Theme, 'components'>>['MuiDesktopDatePicker'] = {
  defaultProps: {
    slots: {
      openPickerButton: (openPickerButtonProps) => (
        <ButtonBase {...openPickerButtonProps} sx={{ fontSize: 'inherit' }}>
          <IconifyIcon icon="material-symbols:calendar-today-outline-rounded" />
        </ButtonBase>
      ),
    },
    slotProps: {
      textField: {
        sx: {
          [`& .${inputBaseClasses.input}::placeholder`]: {
            opacity: '0 !important',
          },
          [`& .${inputBaseClasses.input}::-webkit-input-placeholder`]: {
            opacity: '0 !important',
          },
          [`& .${inputBaseClasses.input}::-moz-placeholder`]: {
            opacity: '0 !important',
          },
        },
      },
      desktopPaper: {
        variant: 'elevation',
        elevation: 3,
      },
    },
  },
};

export default DesktopDatePicker;
