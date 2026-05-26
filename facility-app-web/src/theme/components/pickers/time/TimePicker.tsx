import { ButtonBase, Popper, Theme, inputBaseClasses } from '@mui/material';
import { Components } from '@mui/material/styles';
import { type TimePickerProps, pickersLayoutClasses } from '@mui/x-date-pickers';
import IconifyIcon from 'components/base/IconifyIcon';

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    MuiTimePicker: Partial<TimePickerProps>;
  }

  interface Components {
    MuiTimePicker?: {
      defaultProps?: Partial<TimePickerProps>;
    };
  }
}

const TimePicker: Components<Omit<Theme, 'components'>>['MuiTimePicker'] = {
  defaultProps: {
    slots: {
      popper: (props) => (
        <Popper
          {...props}
          sx={{
            [`& .${pickersLayoutClasses.contentWrapper}`]: {
              gridColumn: '1 / -1',
            },
          }}
        />
      ),

      openPickerButton: (params) => (
        <ButtonBase {...params} sx={{ fontSize: 'inherit' }}>
          <IconifyIcon icon="material-symbols:schedule-outline-rounded" />
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

export default TimePicker;
