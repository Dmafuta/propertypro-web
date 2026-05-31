'use client';

import { useRef, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  useGetDocuments, useUploadDocument, useToggleDocument, useDeleteDocument,
  type AdminDocumentDto, DOCUMENT_CATEGORIES,
} from 'services/swr/api-hooks/useDocumentsApi';

const catMeta = (label: string) =>
  DOCUMENT_CATEGORIES.find(c => c.label === label) ??
  { label, icon: 'material-symbols:description-outline-rounded' };

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EMPTY = { title: '', description: '', category: 0 };

export default function DocumentsPage() {
  const [open, setOpen]         = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [file, setFile]         = useState<File | null>(null);
  const [err, setErr]           = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: docs = [], mutate }           = useGetDocuments();
  const { trigger: upload, isMutating: uploading } = useUploadDocument();
  const { trigger: toggle }                   = useToggleDocument();
  const { trigger: del }                      = useDeleteDocument();

  const active   = docs.filter(d => d.isActive);
  const inactive = docs.filter(d => !d.isActive);

  const handleUpload = async () => {
    if (!form.title.trim())  { setErr('Title is required.'); return; }
    if (!file)               { setErr('Please select a file.'); return; }
    const fd = new FormData();
    fd.append('title',       form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('category',    String(form.category));
    fd.append('file',        file);
    try {
      await upload(fd);
      await mutate();
      setOpen(false);
      setForm(EMPTY);
      setFile(null);
      setErr('');
    } catch (e: any) {
      setErr(e?.data?.error ?? 'Upload failed. Only PDF and Word documents are allowed (max 10 MB).');
    }
  };

  const handleToggle = async (id: string) => { await toggle(id); await mutate(); };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await del(id); await mutate();
  };

  const DocCard = ({ doc }: { doc: AdminDocumentDto }) => {
    const meta = catMeta(doc.category);
    const isPdf = doc.originalFileName.toLowerCase().endsWith('.pdf');
    return (
      <Paper sx={{ p: 3, height: 1, opacity: doc.isActive ? 1 : 0.55, position: 'relative' }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', mb: 2 }}>
          <Avatar variant="rounded" sx={{ bgcolor: 'primary.lighter', borderRadius: 2, mr: 1.5, flexShrink: 0 }}>
            <IconifyIcon
              icon={isPdf ? 'material-symbols:picture-as-pdf-outline-rounded' : meta.icon}
              sx={{ color: 'primary.main' }}
            />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineClamp: 1 }}>{doc.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {doc.category} · {formatBytes(doc.fileSize)}
            </Typography>
          </Box>
        </Stack>

        {doc.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineClamp: 2 }}>
            {doc.description}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {doc.originalFileName}
        </Typography>

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={0.5}>
            {!doc.isActive && <Chip label="Inactive" size="small" color="neutral" variant="soft" />}
            <Typography variant="caption" color="text.secondary">
              {new Date(doc.uploadedAt).toLocaleDateString()}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Download / View">
              <IconButton size="small" component="a" href={doc.fileUrl} target="_blank" rel="noopener">
                <IconifyIcon icon="material-symbols:download-rounded" />
              </IconButton>
            </Tooltip>
            <Tooltip title={doc.isActive ? 'Deactivate' : 'Activate'}>
              <IconButton size="small" onClick={() => handleToggle(doc.id)}>
                <IconifyIcon
                  icon={doc.isActive ? 'material-symbols:toggle-on-rounded' : 'material-symbols:toggle-off-outline-rounded'}
                  sx={{ color: doc.isActive ? 'success.main' : 'text.disabled' }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => handleDelete(doc.id)}>
                <IconifyIcon icon="material-symbols:delete-outline-rounded" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Documents</Typography>
          <Typography variant="body2" color="text.secondary">
            Upload and manage documents available to residents (PDFs, Word files)
          </Typography>
        </Box>
        <Button variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:upload-file-outline-rounded" />}
          onClick={() => { setForm(EMPTY); setFile(null); setErr(''); setOpen(true); }}>
          Upload Document
        </Button>
      </Stack>

      {/* Summary */}
      <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
        <Chip label={`${docs.length} Total`}    color="neutral" variant="soft" />
        <Chip label={`${active.length} Active`}  color="success" variant="soft" />
        {inactive.length > 0 && <Chip label={`${inactive.length} Inactive`} color="neutral" variant="soft" />}
      </Stack>

      {docs.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.lighter', mx: 'auto', mb: 2 }}>
            <IconifyIcon icon="material-symbols:description-outline-rounded" sx={{ fontSize: 32, color: 'primary.main' }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No documents yet</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Upload rules, bylaws, levy schedules, and notices for residents to access.
          </Typography>
          <Button variant="contained" onClick={() => setOpen(true)}>Upload First Document</Button>
        </Paper>
      )}

      {/* Active */}
      {active.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Active
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {active.map(doc => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <DocCard doc={doc} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
            Inactive
          </Typography>
          <Grid container spacing={3}>
            {inactive.map(doc => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <DocCard doc={doc} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {err && <Typography color="error" variant="body2">{err}</Typography>}
            <TextField label="Title *" fullWidth value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category"
                onChange={e => setForm(f => ({ ...f, category: Number(e.target.value) }))}>
                {DOCUMENT_CATEGORIES.map(c => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* File picker */}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Button variant="soft" color="neutral" onClick={() => fileRef.current?.click()}
                startIcon={<IconifyIcon icon="material-symbols:attach-file-rounded" />}>
                {file ? 'Change File' : 'Select File'}
              </Button>
              {file && (
                <Typography variant="body2" color="text.secondary">
                  {file.name} ({formatBytes(file.size)})
                </Typography>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Accepted: PDF, DOC, DOCX · Max 10 MB
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
