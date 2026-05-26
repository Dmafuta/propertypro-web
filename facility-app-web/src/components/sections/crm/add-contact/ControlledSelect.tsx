import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  selectClasses,
} from '@mui/material';

interface ControlledSelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options: { value: string; label: string }[];
  control: Control<T>;
  error: string | undefined;
}

const ControlledSelect = <T extends FieldValues>({
  name,
  label,
  options,
  control,
  error,
}: ControlledSelectProps<T>) => (
  <FormControl fullWidth variant="filled" error={!!error}>
    <InputLabel id={`${name}-label`}>{label}</InputLabel>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          labelId={`${name}-label`}
          {...field}
          value={field.value ?? ''}
          sx={{
            [`& .${selectClasses.icon}`]: {
              zIndex: 1,
              bgcolor: 'inherit',
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )}
    />
    <FormHelperText>{error}</FormHelperText>
  </FormControl>
);

export default ControlledSelect;
