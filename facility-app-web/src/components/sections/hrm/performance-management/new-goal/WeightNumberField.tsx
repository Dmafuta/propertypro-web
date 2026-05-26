import { Controller, useFormContext } from 'react-hook-form';
import NumberField, { NumberFieldProps } from 'components/common/NumberField';
import { CreateNewGoalFormValues } from '.';

type WeightNumberFieldProps = Omit<NumberFieldProps, 'value' | 'onChange'>;

export default function WeightNumberField(props: WeightNumberFieldProps) {
  const { control } = useFormContext<CreateNewGoalFormValues>();
  return (
    <Controller
      control={control}
      name="progressWeight.weight"
      render={({ field: { value, onChange } }) => (
        <NumberField value={value ?? 0} onChange={onChange} {...props} />
      )}
    />
  );
}
