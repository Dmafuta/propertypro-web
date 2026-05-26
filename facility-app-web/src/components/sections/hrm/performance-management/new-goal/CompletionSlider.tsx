import { Controller, useFormContext } from 'react-hook-form';
import SliderInput, { SliderInputProps } from 'components/common/SliderInput';
import { CreateNewGoalFormValues } from '.';

type CompletionSliderProps = Omit<SliderInputProps, 'value' | 'onChange'>;

export default function CompletionSlider(props: CompletionSliderProps) {
  const { control } = useFormContext<CreateNewGoalFormValues>();
  return (
    <Controller
      control={control}
      name="progressWeight.completion"
      render={({ field: { value, onChange, ...rest } }) => (
        <SliderInput value={value} onChange={onChange} {...rest} {...props} />
      )}
    />
  );
}
