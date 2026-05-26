// RatingCard.tsx
import Paper, { PaperProps } from '@mui/material/Paper';
import Rating, { RatingProps } from '@mui/material/Rating';
import Typography, { TypographyProps } from '@mui/material/Typography';

export type RatingCardProps = {
  title: string;
  value?: number | null;
  paperProps?: PaperProps;
  typographyProps?: TypographyProps;
  ratingProps?: RatingProps;
  sx?: PaperProps['sx'];
};

const RatingCard = ({
  title,
  value,
  paperProps,
  typographyProps,
  ratingProps,
  sx,
}: RatingCardProps) => {
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

      <Rating value={value ?? 0} readOnly size="small" {...ratingProps} />
    </Paper>
  );
};

export default RatingCard;
