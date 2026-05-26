import { BoxProps, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';

interface SearchTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  variant?: TextFieldProps['variant'] | 'custom';
  iconSx?: BoxProps['sx'];
}

const SearchTextField = ({ sx, variant = 'custom', iconSx, ...rest }: SearchTextFieldProps) => {
  const Component = variant === 'custom' ? StyledTextField : TextField;
  return (
    <Component
      id="search-box"
      type="search"
      variant={variant !== 'custom' ? variant : undefined}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <IconifyIcon icon="material-symbols:search-rounded" sx={{ ...iconSx }} />
            </InputAdornment>
          ),
        },
      }}
      {...rest}
      sx={[...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
};

export default SearchTextField;
