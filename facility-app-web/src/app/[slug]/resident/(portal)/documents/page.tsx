"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import ComingSoon from "components/common/ComingSoon";
import IconifyIcon from "components/base/IconifyIcon";
import { useResidentDocuments } from "services/swr/api-hooks/useResidentApi";

export default function DocumentsPage() {
  const { data: docs, isLoading, error, mutate } = useResidentDocuments();
  if (error) return <ComingSoon onRetry={mutate} />;

  // Group by category
  const grouped = (docs ?? []).reduce<Record<string, typeof docs>>((acc, doc) => {
    const cat = doc!.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(doc!);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" sx={{ gap: 1, mb: 3 }}>
        <IconifyIcon icon="material-symbols:folder-outline-rounded" sx={{ fontSize: 24, color: "primary.main" }} />
        <Typography variant="h5" fontWeight={700}>Documents</Typography>
      </Stack>

      {isLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      ) : !docs?.length ? (
        <Stack alignItems="center" sx={{ py: 8, gap: 1 }}>
          <IconifyIcon icon="material-symbols:folder-outline-rounded" sx={{ fontSize: 48, color: "text.disabled" }} />
          <Typography variant="body2" color="text.disabled">No documents available.</Typography>
        </Stack>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {category}
            </Typography>
            <Card variant="outlined">
              {items!.map((doc, i) => (
                <Box key={doc!.id}>
                  {i > 0 && <Divider />}
                  <CardActionArea
                    component="a"
                    href={doc!.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ px: 2.5, py: 1.5 }}
                  >
                    <Stack direction="row" alignItems="center" sx={{ gap: 2 }}>
                      <IconifyIcon
                        icon="material-symbols:description-outline-rounded"
                        sx={{ fontSize: 28, color: "primary.main", flexShrink: 0 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{doc!.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded {dayjs(doc!.uploadedAt).format("DD MMM YYYY")}
                        </Typography>
                      </Box>
                      <IconifyIcon icon="material-symbols:download-rounded" sx={{ color: "text.secondary" }} />
                    </Stack>
                  </CardActionArea>
                </Box>
              ))}
            </Card>
          </Box>
        ))
      )}
    </Container>
  );
}
