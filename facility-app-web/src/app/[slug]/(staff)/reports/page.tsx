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
import Grid from '@mui/material/Grid';
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

const today     = new Date();
const thirtyAgo = new Date(today);
thirtyAgo.setDate(today.getDate() - 30);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

function KpiCard({ icon, label, value, color = 'primary' }: {
  icon: string; label: string; value: string | number; color?: string;
}) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, height: 1 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: `${color}.lighter`, borderRadius: 2 }}>
          <IconifyIcon icon={icon} sx={{ fontSize: 28, color: `${color}.main` }} />
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function ReportsPage() {
  const [from, setFrom]         = useState(fmt(thirtyAgo));
  const [to, setTo]             = useState(fmt(today));
  const [applied, setApplied]   = useState({ from: fmt(thirtyAgo), to: fmt(today) });
  const [exporting, setExporting] = useState(false);
  const chartRef = useRef<null | EChartsReactCore>(null);

  const { vars, typography } = useTheme();
  const { getThemeColor }    = useSettingsContext();

  const { data: stats, isLoading } = useGetReportStats(applied.from, applied.to);

  const dailyOptions = useMemo(() => {
    if (!stats?.dailyBreakdown?.length) return null;
    const dates      = stats.dailyBreakdown.map(d => d.date);
    const totals     = stats.dailyBreakdown.map(d => d.total);
    const checkedIn  = stats.dailyBreakdown.map(d => d.checkedIn);
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Total Visits', 'Checked In'], bottom: 0 },
      grid: { left: 0, right: 0, top: 8, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          color: getThemeColor(vars.palette.text.secondary),
          fontFamily: typography.fontFamily,
          fontSize: typography.caption.fontSize,
          rotate: 45,
        },
        axisLine: { lineStyle: { color: getThemeColor(vars.palette.dividerLight) } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: getThemeColor(vars.palette.text.secondary),
          fontFamily: typography.fontFamily,
          fontSize: typography.caption.fontSize,
        },
        splitLine: { lineStyle: { color: getThemeColor(vars.palette.dividerLight) } },
      },
      series: [
        {
          name: 'Total Visits',
          type: 'bar',
          data: totals,
          barMaxWidth: 32,
          itemStyle: { color: getThemeColor(vars.palette.chBlue[200]), borderRadius: [4, 4, 0, 0] },
        },
        {
          name: 'Checked In',
          type: 'bar',
          data: checkedIn,
          barMaxWidth: 32,
          itemStyle: { color: getThemeColor(vars.palette.chGreen[300]), borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  }, [stats, vars.palette, getThemeColor, typography]);

  const hourlyOptions = useMemo(() => {
    if (!stats?.hourlyBreakdown?.length) return null;
    const hours  = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const counts = Array.from({ length: 24 }, (_, i) =>
      stats.hourlyBreakdown.find(h => h.hour === i)?.count ?? 0);
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 0, right: 0, top: 8, bottom: 24, containLabel: true },
      xAxis: {
        type: 'category',
        data: hours,
        axisLabel: {
          color: getThemeColor(vars.palette.text.secondary),
          fontFamily: typography.fontFamily,
          fontSize: 10,
          interval: 2,
        },
        axisLine: { lineStyle: { color: getThemeColor(vars.palette.dividerLight) } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: getThemeColor(vars.palette.text.secondary),
          fontFamily: typography.fontFamily,
          fontSize: typography.caption.fontSize,
        },
        splitLine: { lineStyle: { color: getThemeColor(vars.palette.dividerLight) } },
      },
      series: [{
        type: 'bar',
        data: counts,
        barMaxWidth: 24,
        itemStyle: { color: getThemeColor(vars.palette.chOrange[300]), borderRadius: [4, 4, 0, 0] },
      }],
    };
  }, [stats, vars.palette, getThemeColor, typography]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await axiosInstance.get(
        `/reports/export?from=${applied.from}&to=${applied.to}`,
        { responseType: 'blob' } as any,
      ) as any;
      const blob = new Blob([data], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `visits-${applied.from}-to-${applied.to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const topVisitorCols: GridColDef<VisitorFrequency>[] = [
    { field: 'fullName', headerName: 'Name', flex: 1, minWidth: 160,
      renderCell: ({ row }) => <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.fullName}</Typography> },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180,
      renderCell: ({ row }) => <Typography variant="subtitle2" color="text.secondary">{row.email}</Typography> },
    { field: 'visits', headerName: 'Visits', width: 90,
      renderCell: ({ row }) => <Chip label={row.visits} color="primary" variant="soft" size="small" /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Reports</Typography>
          <Typography variant="body2" color="text.secondary">Visitor analytics and CSV export for any date range</Typography>
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

      {/* Date filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField label="From" type="date" size="small" value={from}
            onChange={e => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="To" type="date" size="small" value={to}
            onChange={e => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button variant="contained" onClick={() => setApplied({ from, to })}>
            Apply
          </Button>
          {isLoading && <CircularProgress size={20} />}
        </Stack>
      </Paper>

      {stats && (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard icon="material-symbols:group-outline-rounded"           label="Total Visits"   value={stats.totalVisits}               color="primary" />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard icon="material-symbols:how-to-reg-outline-rounded"      label="Checked In"    value={stats.totalCheckedIn}             color="success" />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard icon="material-symbols:trending-up-rounded"             label="Check-in Rate"  value={`${stats.checkInRate}%`}          color="info" />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard icon="material-symbols:schedule-outline-rounded"        label="Scheduled"     value={stats.totalScheduled}             color="warning" />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard icon="material-symbols:person-off-outline-rounded"      label="No-shows"      value={stats.totalNoShow}                color="error" />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <KpiCard icon="material-symbols:calendar-today-outline-rounded"  label="Avg / Day"     value={stats.avgPerDay}                  color="secondary" />
            </Grid>
          </Grid>

          {/* Daily Breakdown Chart */}
          {dailyOptions && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Daily Visits Breakdown</Typography>
              <ReactEchart ref={chartRef} echarts={echarts} option={dailyOptions} sx={{ height: 260 }} />
            </Paper>
          )}

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Hourly Chart */}
            {hourlyOptions && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Check-ins by Hour</Typography>
                  <ReactEchart echarts={echarts} option={hourlyOptions} sx={{ height: 200 }} />
                </Paper>
              </Grid>
            )}

            {/* Status Breakdown */}
            <Grid item xs={12} md={hourlyOptions ? 6 : 12}>
              <Paper sx={{ p: 3, height: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Status Breakdown</Typography>
                <Stack spacing={1.5}>
                  {[
                    { label: 'Checked In',  value: stats.totalCheckedIn,  color: 'success' },
                    { label: 'Checked Out', value: stats.totalCheckedOut, color: 'neutral' },
                    { label: 'Scheduled',   value: stats.totalScheduled,  color: 'info' },
                    { label: 'Cancelled',   value: stats.totalCancelled,  color: 'warning' },
                    { label: 'No Show',     value: stats.totalNoShow,     color: 'error' },
                  ].map(item => (
                    <Stack key={item.label} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                        <Chip
                          label={stats.totalVisits > 0 ? `${((item.value / stats.totalVisits) * 100).toFixed(0)}%` : '0%'}
                          color={item.color as any}
                          variant="soft"
                          size="small"
                        />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Visitors */}
          {stats.topVisitors.length > 0 && (
            <Paper sx={{ mb: 4 }}>
              <Box sx={{ p: 3, pb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Top Visitors</Typography>
                <Typography variant="body2" color="text.secondary">Most frequent visitors in the period</Typography>
              </Box>
              <DataGrid
                rows={stats.topVisitors}
                columns={topVisitorCols}
                getRowId={row => row.email}
                hideFooter
                disableRowSelectionOnClick
                disableColumnMenu
                sx={{ border: 0 }}
              />
            </Paper>
          )}
        </>
      )}

      {!stats && !isLoading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">Select a date range and click Apply to generate the report.</Typography>
        </Paper>
      )}
    </Box>
  );
}
