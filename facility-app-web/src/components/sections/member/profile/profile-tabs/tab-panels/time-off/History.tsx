'use client';

import { MouseEvent, useMemo, useState } from 'react';
import { Button, MenuItem, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { timeOffData } from 'data/member/profile';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';
import StyledTextField from 'components/styled/StyledTextField';

interface HistoryProps {
  data: (typeof timeOffData)['history'];
}

const columnDefs: GridColDef<(typeof timeOffData)['history'][number]>[] = [
  {
    field: 'date',
    headerName: 'Date',
    headerClassName: 'date-header',
    cellClassName: 'date-cell',
    flex: 1.2,
    minWidth: 130,
  },
  {
    field: 'day',
    headerName: 'Day',
    headerClassName: 'day-header',
    cellClassName: 'day-cell',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'hour',
    headerName: 'Hour',
    headerClassName: 'hour-header',
    cellClassName: 'hour-cell',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'reason',
    headerName: 'Reason',
    headerClassName: 'reason-header',
    cellClassName: 'reason-cell',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'approver',
    headerName: 'Approver',
    headerClassName: 'approver-header',
    cellClassName: 'approver-cell',
    flex: 1,
    minWidth: 100,
  },
  {
    field: 'action',
    headerName: '',
    sortable: false,
    headerClassName: 'action-header',
    cellClassName: 'action-cell',
    filterable: false,
    width: 60,
    align: 'right',
    headerAlign: 'right',
    renderHeader: () => <DashboardMenu />,
    renderCell: () => <DashboardMenu />,
  },
];

const History = ({ data }: HistoryProps) => {
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  const apiRef = useGridApiRef();

  const columns = useMemo(() => columnDefs, []);

  const handleToggleFilterPanel = (e: MouseEvent<HTMLButtonElement>) => {
    const clickedEl = e.currentTarget;

    if (filterButtonEl && filterButtonEl === clickedEl) {
      setFilterButtonEl(null);
      apiRef.current?.hideFilterPanel();

      return;
    }

    setFilterButtonEl(clickedEl);
    apiRef.current?.showFilterPanel();
  };
  return (
    <Stack sx={{ gap: 2, pt: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        History
      </Typography>
      <Stack sx={{ gap: 4 }}>
        <TopAction handleToggleFilterPanel={handleToggleFilterPanel} />

        <Stack sx={{ width: 1 }}>
          <DataGrid
            apiRef={apiRef}
            rows={data}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 7,
                },
              },
            }}
            pageSizeOptions={[7]}
            slots={{
              basePagination: (props) => (
                <DataGridPagination showAllHref="#!" showFullPagination {...props} />
              ),
            }}
            slotProps={{
              panel: {
                target: filterButtonEl,
              },
            }}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                '& .MuiDataGrid-columnHeader': {
                  '&.date-header': {
                    paddingLeft: 3,
                  },
                },
              },
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

const TopAction = ({
  handleToggleFilterPanel,
}: {
  handleToggleFilterPanel: (e: MouseEvent<HTMLButtonElement>) => void;
}) => {
  const [sortBy, setSortBy] = useState<string>('6-months');
  return (
    <Stack direction="row" sx={{ gap: 1 }}>
      <StyledTextField
        select
        value={sortBy}
        fullWidth
        onChange={(event) => setSortBy(event.target.value)}
        sx={{ maxWidth: 234 }}
      >
        <MenuItem value="week">Sort by - Last week</MenuItem>
        <MenuItem value="month">Sort by - Last month</MenuItem>
        <MenuItem value="3-months">Sort by - Last 3 months</MenuItem>
        <MenuItem value="6-months">Sort by - Last 6 months</MenuItem>
      </StyledTextField>
      <Button
        variant="soft"
        color="neutral"
        startIcon={<IconifyIcon icon="material-symbols:filter-alt-outline" />}
        onClick={handleToggleFilterPanel}
      >
        Filter
      </Button>
    </Stack>
  );
};

export default History;
