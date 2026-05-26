import type { ComponentsOverrides, Theme } from '@mui/material/styles';
import { Components } from '@mui/material/styles';
import {
  getPickersInputBaseUtilityClass,
  pickersInputBaseClasses,
  pickersOutlinedInputClasses,
} from '@mui/x-date-pickers';

declare module '@mui/material/styles' {
  interface ComponentNameToClassKey {
    MuiPickersOutlinedInput: 'root' | 'notchedOutline' | 'input' | 'sectionsContainer';
  }

  interface Components {
    MuiPickersOutlinedInput?: {
      styleOverrides?: ComponentsOverrides<Theme>['MuiPickersOutlinedInput'];
    };
  }
}

const pickersSectionsContainerClass = getPickersInputBaseUtilityClass('sectionsContainer');

const PickersOutlinedInput: Components<Omit<Theme, 'components'>>['MuiPickersOutlinedInput'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: 8,
      padding: '0 16px',
      ':hover': {
        [`&:not(.${pickersOutlinedInputClasses.focused}):not(.${pickersOutlinedInputClasses.disabled}):not(.${pickersOutlinedInputClasses.error})`]:
          {
            [`& .${pickersOutlinedInputClasses.notchedOutline}`]: {
              borderColor: theme.vars.palette.action.disabled,
            },
          },
      },
      [`&.${pickersOutlinedInputClasses.disabled}`]: {
        cursor: 'not-allowed',
        [`& .${pickersOutlinedInputClasses.notchedOutline}`]: {
          borderColor: theme.vars.palette.divider,
        },
        '*': {
          color: theme.vars.palette.action.disabled,
        },
      },
      [`&.${pickersOutlinedInputClasses.focused} .${pickersOutlinedInputClasses.notchedOutline}`]: {
        borderColor: theme.vars.palette.primary.main,
        borderWidth: '1px !important',
      },
      [`&.${pickersOutlinedInputClasses.error} .${pickersOutlinedInputClasses.notchedOutline}`]: {
        borderColor: theme.vars.palette.error.main,
      },
      [`&.${pickersInputBaseClasses.inputSizeSmall}`]: {
        borderRadius: 4,
        [`& .${pickersOutlinedInputClasses.notchedOutline}`]: {
          padding: '0 6px',
        },
      },
      [`&.${pickersInputBaseClasses.inputSizeSmall} .${pickersSectionsContainerClass}`]: {
        paddingTop: 9,
        paddingBottom: 9,
        paddingLeft: 0,
        paddingRight: 0,
        fontSize: 14,
      },
      [`&.${pickersInputBaseClasses.adornedStart}`]: {
        paddingLeft: 16,
      },
      [`&.${pickersInputBaseClasses.adornedStart}.${pickersInputBaseClasses.inputSizeSmall}`]: {
        paddingLeft: 12,
      },
      [`&.${pickersInputBaseClasses.adornedStart} .${pickersSectionsContainerClass}`]: {
        paddingLeft: 0,
      },
      [`&.${pickersInputBaseClasses.adornedEnd}`]: {
        paddingRight: 10,
      },
    }),
    notchedOutline: ({ theme }) => ({
      borderStyle: 'solid',
      borderColor: theme.vars.palette.divider,
      borderWidth: '1px !important',
    }),
    sectionsContainer: {
      paddingTop: 14,
      paddingBottom: 14,
      paddingLeft: 0,
      paddingRight: 0,
      fontSize: 14,
      lineHeight: 1.45,
      [`& .${pickersInputBaseClasses.sectionContent}`]: {
        '&::-webkit-input-placeholder': {
          opacity: '1 !important',
        },
        '&::-moz-placeholder': {
          opacity: '1 !important',
        },
      },
    },
  },
};

export default PickersOutlinedInput;
