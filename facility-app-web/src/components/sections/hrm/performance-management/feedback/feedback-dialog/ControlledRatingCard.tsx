import type { FieldPath } from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';
import Paper, { PaperProps } from '@mui/material/Paper';
import Rating, { RatingProps } from '@mui/material/Rating';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { ReportFormValues } from './ReportFormDialog';

export type ReportRatingStarFieldPath = Extract<
  FieldPath<ReportFormValues>,
  `${'communication' | 'teamwork' | 'problemSolving'}.rating.${number}`
>;

export type ControlledRatingCardProps = {
  title: string;
  fieldName: ReportRatingStarFieldPath;
  paperProps?: PaperProps;
  typographyProps?: TypographyProps;
  ratingProps?: RatingProps;
  sx?: PaperProps['sx'];
};

const ControlledRatingCard = ({
  title,
  fieldName,
  paperProps,
  typographyProps,
  ratingProps,
  sx,
}: ControlledRatingCardProps) => {
  const { control } = useFormContext<ReportFormValues>();

  return (
    <Paper
      background={1}
      sx={{
        px: 2,
        py: 1,
        outline: 0,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...sx,
      }}
      {...paperProps}
    >
      <Typography variant="body2" {...typographyProps}>
        {title}
      </Typography>

      <Controller<ReportFormValues, ReportRatingStarFieldPath>
        name={fieldName}
        control={control}
        render={({ field }) => (
          <Rating
            {...field}
            value={field.value ?? 0}
            onChange={(_event, newValue) => {
              field.onChange(newValue);
            }}
            size="small"
            {...ratingProps}
          />
        )}
      />
    </Paper>
  );
};

export default ControlledRatingCard;
