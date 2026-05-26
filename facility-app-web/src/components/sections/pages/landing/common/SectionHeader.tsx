import { useTheme } from '@mui/material';
import Stack, { StackOwnProps } from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RevealText from './RevealText';

interface SectionHeaderProps extends StackOwnProps {
  title: string;
  subtitle: string;
}

const SectionHeader = ({ title, subtitle, sx, ...rest }: SectionHeaderProps) => {
  const { direction } = useTheme();

  return (
    <Stack
      key={direction}
      {...rest}
      sx={[
        {
          gap: 1,
          textAlign: 'center',
        },
        ...(Array.isArray(sx) ? sx : sx != null ? [sx] : []),
      ]}
    >
      <RevealText delay={0.2}>
        <Typography
          variant="overline"
          sx={{
            color: 'text.disabled',
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>
      </RevealText>
      <RevealText>
        <Typography variant="h4">{subtitle}</Typography>
      </RevealText>
    </Stack>
  );
};

export default SectionHeader;
