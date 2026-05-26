'use client';

import { MenuItem, MenuItemProps, TextField, TextFieldProps } from '@mui/material';
import StyledTextField from 'components/styled/StyledTextField';

type DashboardSelectMenuProps = Omit<TextFieldProps, 'defaultValue' | 'onChange' | 'variant'> & {
  options?: {
    value: string | number;
    label: string;
  }[];
  defaultValue?: string | number;
  variant?: TextFieldProps['variant'] | 'custom';
  onChange?: (value: string | number) => void;
  menuItemProps?: MenuItemProps;
};

const defaultOptions = [
  {
    value: 1,
    label: 'Last month',
  },
  {
    value: 6,
    label: 'Last 6 months',
  },
  {
    value: 12,
    label: 'Last 12 months',
  },
];

const DashboardSelectMenu = ({
  options = defaultOptions,
  onChange,
  defaultValue = defaultOptions[0].value,
  label,
  size = 'small',
  variant = 'custom',
  menuItemProps,
  sx,
  ...rest
}: DashboardSelectMenuProps) => {
  const Component = variant === 'custom' ? StyledTextField : TextField;
  const handleChange = (value: string | number) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <Component
      select
      defaultValue={defaultValue}
      label={variant !== 'custom' ? label : undefined}
      variant={variant !== 'custom' ? variant : undefined}
      size={size}
      onChange={({ target: { value } }) => handleChange(value as string)}
      sx={{ width: 150, minWidth: 120, ...sx }}
      {...rest}
    >
      {options.map((option) => (
        <MenuItem {...menuItemProps} value={option.value} key={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Component>
  );
};

export default DashboardSelectMenu;
