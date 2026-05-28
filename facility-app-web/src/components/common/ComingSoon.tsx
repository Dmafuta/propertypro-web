"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconifyIcon from "components/base/IconifyIcon";

interface ComingSoonProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ComingSoon({
  title = "Coming Soon",
  message = "This feature is currently being built and will be available shortly.",
  onRetry,
}: ComingSoonProps) {
  return (
    <Stack
      sx={{ minHeight: 320, py: 8, px: 3, textAlign: "center", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "primary.softBg",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <IconifyIcon
          icon="material-symbols:construction-outline-rounded"
          sx={{ fontSize: 40, color: "primary.main" }}
        />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mb: 3 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<IconifyIcon icon="material-symbols:refresh-rounded" />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Stack>
  );
}
