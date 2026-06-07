'use client';

import { useMemo, useRef, useState } from 'react';
import type { EChartsReactCore } from 'echarts-for-react/lib/types';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import ReactEchart from 'components/base/ReactEchart';
import { useSettingsContext } from 'providers/SettingsProvider';
import { useGetReportStats, type VisitorFrequency } from 'services/swr/api-hooks/useReportsApi';
import axiosInstance from 'services/axios/axiosInstance';

echarts.use([GridComponent, TooltipComponent, BarChart, LineChart, CanvasRenderer, LegendComponent]);

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (d: Date) => d.toISOString().slice(0, 10);

function getPresetRange(preset: string): { from: string; to: string } {
  const today = new Date();
  const to    = fmt(today);
  if (preset === '7d')  { const f = new Date(today); f.setDate(today.getDate() - 6);  return { from: fmt(f), to }; }
  if (preset === '30d') { const f = new Date(today); f.setDate(today.getDate() - 29); return { from: fmt(f), to }; }
  if (preset === 'mtd') { return { from: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), to }; }
  if (preset === '3m')  { const f = new Date(today); f.setMonth(today.getMonth() - 3); return { from: fmt(f), to }; }
  if (preset === '6m')  { const f = new Date(today); f.setMonth(today.getMonth() - 6); return { from: fmt(f), to }; }
  // today
  return { from: to, to };
}

const PRESETS = [
  { key: 'today', label: 'Today'    },
  { key: '7d',    label: '7 Days'   },
  { key: '30d',   label: '30 Days'  },
  { key: 'mtd',   label: 'This Month' },
  { key: '3m',    label: '3 Months' },
  { key: '6m',    label: '6 Months' },
];

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, color = 'primary', sub }: {
  icon: string; label: string; value: string | number; color?: string; sub?: string;
}) {
  return (
    <Paper sx={{ p: { xs: 2.5, md: 3 }, height: 1 }}>
      <Stack gap={2}>
        <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: `${color}.lighter`, borderRadius: 2 }}>
          <IconifyIcon icon={icon} sx={{ fontSize: 24, color: `${color}.main` }} />
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
          {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
        </Box>
      </Stack>
    </Paper>
  );
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({
  label, value, total, color,
}: {
  label: string; value: number; total: number; color: 'success' | 'error' | 'warning' | 'info' | 'neutral';
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Stack gap={0.75}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Stack direction="row" gap={1} alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{value.toLocaleString()}</Typography>
          <Chip label={`${pct}%`} color={color} variant="soft" size="small" />
        </Stack>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={color === 'neutral' ? 'inherit' : color}
        sx={{ height: 6, borderRadius: 3, bgcolor: 'background.elevation2' }}
      />
    </Stack>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const defaultRange = getPresetRange('30d');
  const [from,      setFrom]     = useState(defaultRange.from);
  const [to,        setTo]       = useState(defaultRange.to);
  const [applied,   setApplied]  = useState(defaultRange);
  const [preset,    setPreset]   = useState('30d');
  const [exporting, setExporting] = useState(false);
  const chartRef = useRef<null | EChartsReactCore>(null);

  const { vars, typography } = useTheme();
  const { getThemeColor }    = useSettingsContext();

  const { data: stats, isLoading } = useGetReportStats(applied.from, applied.to);

  const handlePreset = (key: string) => {
    const range = getPresetRange(key);
    setFrom(range.from); setTo(range.to);
    setApplied(range); setPreset(key);
  };

  const handleApply = () => { setApplied({ from, to }); setPreset(''); };

  // Daily breakdown — dual bar (Total vs Checked In)
  const dailyOptions = useMemo(() => {
    if (!stats?.dailyBreakdown?.length) return null;
    const dates     = stats.dailyBreakdown.map((d) => d.date);
    const totals    = stats.dailyBreakdown.map((d) => d.total);
    const checkedIn = stats.dailyBreakdown.map((d) => d.checkedIn);
    const noShow    = stats.dailyBreakdown.map((d) => d.noShow);
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Visits', 'Checked In', 'No-show'], bottom: 0, textStyle: { color: getThemeColor(vars.palette.text.secondary), fontFamily: typography.fontFamily, fontSize: 12 } },
      grid: { left: 0, right: 0, top: 8, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category', data: dates,
        axisLabel: { color: getThemeColor(vars.palette.text.secondary), fontFamily: typography.fontFamily, fontSize: 11, rotate: dates.length > 20 ? 45 : 0 },
        axisLine: { lineStyle: { color: getThemeColor(vars.palette.dividerLight) } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: getThemeColor(vars.palette.text.secondary), fontFamily: typography.fontFamily, fontSize: 11 },
        splitLine: { lineStyle: { color: getThemeColor(vars.palette.dividerLight) } },
      },
      series: [
        {
          name: 'Visits',
          type: 'bar',
          data: totals,
          barMaxWidth: 28,
          itemStyle: { color: getThemeColor(vars.palette.chBlue[200]), borderRadius: [4, 4, 0, 0] },
        },
        {
          name: 'Checked In',
          type: 'bar',
          data: checkedIn,
          barMaxWidth: 28,
          itemStyle: { color: getThemeColor(vars.palette.chGreen[300]), borderRadius: [4, 4, 0, 0] },
        },
        {
          name: 'No-show',
          type: 'line',
          data: noShow,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: getThemeColor(vars.palette.chOrange[300]), width: 2 },
          itemStyle: { color: getThemeColor(vars.palette.chOrange[300]) },
        },
      ],
    };
  }, [stats, vars.palette, getThemeColor, typography]);

  // Hourly heatmap-style bar
  const hourlyOptions = useMemo(() => {
    if (!stats?.hourlyBreakdown?.length) return null;
    const hours  = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const counts = Array.from({ length: 24 }, (_, i) =>
      stats.hourlyBreakdown.find((h) => h.hour === i)?.count ?? 0,
    );
    const max = Math.max(...counts, 1);
    return {
      tooltip: { trigger: 'axis', formatter: (p: any[]) => `${p[0].name}: ${p[0].value} check-ins` },
      grid: { left: 0, right: 0, top: 4, bottom: 24, containLabel: true },
      xAxis: {
        type: 'category', data: hours,
        axisLabel: { color: getThemeColor(vars.palette.text.secondary), fontFamily: typography.fontFamily, fontSize: 10, interval: 3 },
        axisLine: { lineStyle: { color: getThemeColor(vars.palette.dividerLight) } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: getThemeColor(vars.palette.text.secondary), fontFamily: typography.fontFamily, fontSize: 10 },
        splitLine: { lineStyle: { color: getThemeColor(vars.palette.dividerLight) } },
      },
      series: [{
        type: 'bar',
        data: counts.map((v) => ({
          value: v,
          itemStyle: {
            color: getThemeColor(vars.palette.chBlue[200]),
            opacity: 0.3 + 0.7 * (v / max),
            borderRadius: [3, 3, 0, 0],
          },
        })),
        barMaxWidth: 20,
      }],
    };
  }, [stats, vars.palette, getThemeColor, typography]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await axiosInstance.get(
        `/reports/export?from=${applied.from}&to=${applied.to}`,
        { responseType: 'blob' } as any,
      ) as any;
      const url = URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const a   = document.createElement('a');
      a.href = url; a.download = `visits-${applied.from}-to-${applied.to}.csv`; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const topVisitorCols: GridColDef<VisitorFrequency>[] = [
    {
      field: 'fullName', headerName: 'Name', flex: 1, minWidth: 160,
      renderCell: ({ row }) => (
        <Stack direction="row" gap={1.5} alignItems="center" sx={{ height: 1 }}>
          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.lighter', color: 'primary.main', fontSize: 11, fontWeight: 700 }}>
            {row.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.fullName}</Typography>
        </Stack>
      ),
    },
    {
      field: 'email', headerName: 'Email', flex: 1, minWidth: 180,
      renderCell: ({ row }) => <Typography variant="subtitle2" color="text.secondary">{row.email}</Typography>,
    },
    {
      field: 'visits', headerName: 'Visits', width: 90,
      renderCell: ({ row }) => <Chip label={row.visits} color="primary" variant="soft" size="small" />,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            Visitor analytics and CSV export for any date range
          </Typography>
        </Box>
        <Button
          variant="soft"
          color="success"
          startIcon={<IconifyIcon icon="material-symbols:download-rounded" />}
          onClick={handleExport}
          disabled={exporting || !stats}
        >
          {exporting ? 'Exporting…' : 'Export CSV'}
        </Button>
      </Stack>

      {/* Date range filter */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack gap={2}>
          {/* Presets */}
          <Stack direction="row" gap={1} flexWrap="wrap">
            {PRESETS.map((p) => (
              <Chip
                key={p.key}
                label={p.label}
                variant={preset === p.key ? 'filled' : 'soft'}
                color={preset === p.key ? 'primary' : 'neutral'}
                size="small"
                onClick={() => handlePreset(p.key)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
          <Divider />
          {/* Custom range */}
          <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">Custom range:</Typography>
            <TextField
              label="From" type="date" size="small" value={from}
              onChange={(e) => { setFrom(e.target.value); setPreset(''); }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To" type="date" size="small" value={to}
              onChange={(e) => { setTo(e.target.value); setPreset(''); }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button variant="contained" size="small" onClick={handleApply}>Apply</Button>
            {isLoading && <CircularProgress size={18} />}
          </Stack>
          {applied.from && (
            <Typography variant="caption" color="text.secondary">
              Showing: {new Date(applied.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' '}→{' '}
              {new Date(applied.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Typography>
          )}
        </Stack>
      </Paper>

      {isLoading && !stats && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading report…</Typography>
        </Paper>
      )}

      {stats && (
        <>
          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { icon: 'material-symbols:group-outline-rounded',          label: 'Total Visits',   value: stats.totalVisits.toLocaleString(),         color: 'primary'   },
              { icon: 'material-symbols:how-to-reg-outline-rounded',     label: 'Checked In',     value: stats.totalCheckedIn.toLocaleString(),      color: 'success'   },
              { icon: 'material-symbols:trending-up-rounded',            label: 'Check-in Rate',  value: `${stats.checkInRate}%`,                   color: 'info'      },
              { icon: 'material-symbols:schedule-outline-rounded',       label: 'Scheduled',      value: stats.totalScheduled.toLocaleString(),      color: 'warning'   },
              { icon: 'material-symbols:person-off-outline-rounded',     label: 'No-shows',       value: stats.totalNoShow.toLocaleString(),         color: 'error'     },
              { icon: 'material-symbols:calendar-today-outline-rounded', label: 'Avg / Day',      value: stats.avgPerDay.toLocaleString(),           color: 'secondary' },
            ].map((card) => (
              <Grid key={card.label} size={{ xs: 6, sm: 4, md: 2 }}>
                <KpiCard {...card} />
              </Grid>
            ))}
          </Grid>

          {/* Daily Breakdown Chart */}
          {dailyOptions && (
            <Paper sx={{ p: { xs: 2.5, md: 4 }, mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
                Daily Visits Breakdown
              </Typography>
              <ReactEchart ref={chartRef} echarts={echarts} option={dailyOptions} sx={{ height: 280 }} />
            </Paper>
          )}

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Hourly check-in heatmap */}
            {hourlyOptions && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: { xs: 2.5, md: 4 }, height: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Check-ins by Hour</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Peak activity times during the period
                  </Typography>
                  <ReactEchart echarts={echarts} option={hourlyOptions} sx={{ height: 220 }} />
                </Paper>
              </Grid>
            )}

            {/* Status breakdown with progress bars */}
            <Grid size={{ xs: 12, md: hourlyOptions ? 6 : 12 }}>
              <Paper sx={{ p: { xs: 2.5, md: 4 }, height: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Visit Status Breakdown</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Distribution across all visit outcomes
                </Typography>
                <Stack gap={2.5}>
                  {[
                    { label: 'Checked In',  value: stats.totalCheckedIn,  color: 'success' as const },
                    { label: 'Checked Out', value: stats.totalCheckedOut, color: 'info'    as const },
                    { label: 'Scheduled',   value: stats.totalScheduled,  color: 'warning' as const },
                    { label: 'No-show',     value: stats.totalNoShow,     color: 'error'   as const },
                    { label: 'Cancelled',   value: stats.totalCancelled,  color: 'neutral' as const },
                  ].map((item) => (
                    <StatusBar key={item.label} total={stats.totalVisits} {...item} />
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Visitors */}
          {stats.topVisitors.length > 0 && (
            <Paper sx={{ mb: 4 }}>
              <Box sx={{ p: { xs: 2.5, md: 4 }, pb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Top Visitors</Typography>
                <Typography variant="body2" color="text.secondary">Most frequent visitors in the period</Typography>
              </Box>
              <DataGrid
                rows={stats.topVisitors}
                columns={topVisitorCols}
                getRowId={(row) => row.email}
                hideFooter
                disableRowSelectionOnClick
                disableColumnMenu
                sx={{ border: 0 }}
              />
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
