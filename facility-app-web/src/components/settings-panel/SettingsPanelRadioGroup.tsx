import { formControlLabelClasses, radioClasses, RadioGroup, RadioGroupProps } from '@mui/material';

const SettingsPanelRadioGroup = ({ children, ...rest }: RadioGroupProps) => {
  return (
    <RadioGroup
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        [`& .${formControlLabelClasses.root}`]: { margin: 0 },
        [`& .${radioClasses.root}`]: { display: 'none' },
      }}
      {...rest}
    >
      {children}
    </RadioGroup>
  );
};

export default SettingsPanelRadioGroup;
