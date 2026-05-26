import Paper from '@mui/material/Paper';
import Slider, { SliderProps } from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';

export interface SliderInputProps extends Omit<
  SliderProps,
  'value' | 'onChange' | 'min' | 'max' | 'step' | 'sx'
> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  sx?: SxProps<Theme>;
}

export default function SliderInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  valueFormatter = (val) => `${val}%`,
  sx,
}: SliderInputProps) {
  return (
    <Paper background={1} sx={{ outline: 0, width: 1, px: 2, py: 0.5, borderRadius: 2, ...sx }}>
      <Stack direction="row" sx={{ gap: 1 }}>
        <Slider
          className="slider-input-slider"
          value={value}
          onChange={(_, v) => onChange(v as number)}
          min={min}
          max={max}
          step={step}
          aria-label={label}
          valueLabelDisplay="auto"
          valueLabelFormat={valueFormatter}
          getAriaValueText={valueFormatter}
        />
        {showValue && (
          <Typography
            className="slider-input-text"
            sx={{
              fontWeight: 700,
              textAlign: 'right',
              minWidth: 50,
            }}
          >
            {valueFormatter(value)}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
