"use client";

import { useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import ComingSoon from "components/common/ComingSoon";
import IconifyIcon from "components/base/IconifyIcon";
import { useResidentDocuments, type ResidentDocument } from "services/swr/api-hooks/useResidentApi";

// ── File type helpers ─────────────────────────────────────────────────────────

type FileType = 'pdf' | 'word' | 'excel' | 'image' | 'text' | 'file';

function getFileType(url: string): FileType {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf')                         return 'pdf';
  if (['doc', 'docx'].includes(ext))         return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext))  return 'excel';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['txt', 'md'].includes(ext))           return 'text';
  return 'file';
}

const FILE_TYPE_CONFIG: Record<FileType, { icon: string; color: string; label: string }> = {
  pdf:   { icon: 'material-symbols:picture-as-pdf-outline-rounded', color: 'error',     label: 'PDF'      },
  word:  { icon: 'material-symbols:article-outline-rounded',        color: 'info',      label: 'Word'     },
  excel: { icon: 'material-symbols:table-view-outline-rounded',     color: 'success',   label: 'Spreadsheet' },
  image: { icon: 'material-symbols:image-outline-rounded',          color: 'secondary', label: 'Image'    },
  text:  { icon: 'material-symbols:description-outline-rounded',    color: 'neutral',   label: 'Text'     },
  file:  { icon: 'material-symbols:insert-drive-file-outline-rounded', color: 'primary', label: 'File'   },
};

// ── Document Card ─────────────────────────────────────────────────────────────

function DocCard({ doc }: { doc: ResidentDocument }) {
  const fileType = getFileType(doc.fileUrl);
  const cfg      = FILE_TYPE_CONFIG[fileType];

  return (
    <Tooltip title={`Download ${doc.title}`} placement="top">
      <Paper
        component="a"
        href={doc.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          p: 2.5,
          display: 'block',
          textDecoration: 'none',
          transition: 'all 0.15s',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.light',
            transform: 'translateY(-2px)',
            boxShadow: 4,
          },
        }}
      >
        <Stack gap={2}>
          {/* Icon + download indicator */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Avatar
              variant="rounded"
              sx={{
                width: 48, height: 48,
                bgcolor: `${cfg.color}.lighter`,
                borderRadius: 2,
              }}
            >
              <IconifyIcon icon={cfg.icon} sx={{ fontSize: 28, color: `${cfg.color}.main` }} />
            </Avatar>
            <IconifyIcon
              icon="material-symbols:download-rounded"
              sx={{ fontSize: 20, color: 'text.disabled', mt: 0.5 }}
            />
          </Stack>

          {/* Title & meta */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {doc.title}
            </Typography>
            <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap">
              <Chip label={cfg.label} color={cfg.color as any} variant="soft" size="small" />
              <Typography variant="caption" color="text.disabled">
                {dayjs(doc.uploadedAt).format("DD MMM YYYY")}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Tooltip>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function DocSkeleton() {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack gap={2}>
        <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2 }} />
        <Stack gap={0.75}>
          <Skeleton variant="text" width="80%" height={16} />
          <Skeleton variant="text" width="50%" height={16} />
          <Skeleton variant="rounded" width={56} height={20} sx={{ borderRadius: 1, mt: 0.5 }} />
        </Stack>
      </Stack>
    </Paper>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [search, setSearch] = useState('');

  const { data: docs, isLoading, error, mutate } = useResidentDocuments();
  if (error) return <ComingSoon onRetry={mutate} />;

  // Filter by search
  const filtered = useMemo(() => {
    if (!docs) return [];
    if (!search.trim()) return docs;
    const q = search.toLowerCase();
    return docs.filter(
      (d) => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q),
    );
  }, [docs, search]);

  // Group by category
  const grouped = useMemo(
    () =>
      filtered.reduce<Record<string, ResidentDocument[]>>((acc, doc) => {
        const cat = doc.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(doc);
        return acc;
      }, {}),
    [filtered],
  );

  const totalDocs = docs?.length ?? 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} sx={{ mb: 4 }}>
        <Stack direction="row" gap={1.5} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{ width: 44, height: 44, bgcolor: 'primary.lighter', borderRadius: 2 }}
          >
            <IconifyIcon icon="material-symbols:folder-outline-rounded" sx={{ fontSize: 26, color: 'primary.main' }} />
          </Avatar>
          <Box>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Documents</Typography>
              {totalDocs > 0 && (
                <Chip label={totalDocs} color="primary" variant="soft" size="small" />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Property documents and notices
            </Typography>
          </Box>
        </Stack>

        {/* Search */}
        {totalDocs > 0 && (
          <TextField
            size="small"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 260 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="material-symbols:search-rounded" sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconifyIcon
                      icon="material-symbols:close-rounded"
                      sx={{ fontSize: 18, color: 'text.secondary', cursor: 'pointer' }}
                      onClick={() => setSearch('')}
                    />
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        )}
      </Stack>

      {/* Loading */}
      {isLoading && (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <DocSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty — no documents at all */}
      {!isLoading && totalDocs === 0 && (
        <Paper sx={{ py: 10, textAlign: 'center' }}>
          <Avatar
            variant="rounded"
            sx={{ width: 72, height: 72, bgcolor: 'background.elevation1', borderRadius: 3, mx: 'auto', mb: 2 }}
          >
            <IconifyIcon icon="material-symbols:folder-outline-rounded" sx={{ fontSize: 40, color: 'text.disabled' }} />
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} color="text.secondary">
            No documents yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Your property documents and notices will appear here
          </Typography>
        </Paper>
      )}

      {/* No search results */}
      {!isLoading && totalDocs > 0 && filtered.length === 0 && (
        <Paper sx={{ py: 8, textAlign: 'center' }}>
          <IconifyIcon icon="material-symbols:search-off-rounded" sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.disabled">
            No documents match &ldquo;{search}&rdquo;
          </Typography>
        </Paper>
      )}

      {/* Grouped document grid */}
      {!isLoading && Object.entries(grouped).map(([category, items]) => (
        <Box key={category} sx={{ mb: 5 }}>
          <Stack direction="row" gap={1.5} alignItems="center" sx={{ mb: 2 }}>
            <IconifyIcon
              icon="material-symbols:folder-open-outline-rounded"
              sx={{ fontSize: 20, color: 'primary.main' }}
            />
            <Typography
              variant="overline"
              sx={{ fontWeight: 700, letterSpacing: 0.8, color: 'text.secondary' }}
            >
              {category}
            </Typography>
            <Chip label={items.length} variant="soft" size="small" />
          </Stack>

          <Grid container spacing={2}>
            {items.map((doc) => (
              <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <DocCard doc={doc} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
}
