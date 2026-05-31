'use client';

import Grid from '@mui/material/Grid';
import { KPIData } from 'types/crm';
import { useGetDashboard } from 'services/swr/api-hooks/useDashboardApi';
import KPI from './KPI';

interface CRMKPIsProps {
  data: KPIData[];
}

const CRMKPIs = ({ data }: CRMKPIsProps) => {
  const { data: stats } = useGetDashboard();

  const totalUnits    = stats?.totalUnits    ?? 0;
  const occupiedUnits = stats?.occupiedUnits ?? 0;
  const occupancyRate = totalUnits > 0 ? `${Math.round((occupiedUnits / totalUnits) * 100)}%` : '—';

  const enriched: KPIData[] = data.map((kpi) => {
    if (kpi.title === 'Total Units')    return { ...kpi, value: totalUnits };
    if (kpi.title === 'Occupied Units') return { ...kpi, value: occupiedUnits };
    return kpi;
  });

  const occupancyKpi: KPIData = {
    title: 'Occupancy Rate',
    value: occupancyRate,
    subtitle: 'Occupied / total units',
    icon: {
      name: 'material-symbols-light:percent-rounded',
      color: occupiedUnits / (totalUnits || 1) >= 0.8 ? 'success.main' : 'warning.main',
    },
  };

  return (
    <>
      {enriched.map((kpi) => (
        <Grid key={kpi.title} size={{ xs: 6, sm: 4, lg: 6, xl: 4 }}>
          <KPI {...kpi} />
        </Grid>
      ))}

      <Grid size={{ xs: 6, sm: 4, lg: 6, xl: 4 }}>
        <KPI {...occupancyKpi} />
      </Grid>
    </>
  );
};

export default CRMKPIs;
