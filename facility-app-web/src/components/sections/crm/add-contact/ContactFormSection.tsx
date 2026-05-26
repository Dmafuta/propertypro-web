import { Box, Stack, SxProps, Typography } from '@mui/material';

const ContactFormSection = ({
  title,
  children,
  sx,
}: {
  title: string;
  children: React.ReactNode;
  sx?: SxProps;
}) => (
  <Box sx={{ ...sx }}>
    <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 700 }}>
      {title}
    </Typography>
    <Stack sx={{ gap: 2, alignItems: 'center' }}>{children}</Stack>
  </Box>
);

export default ContactFormSection;
