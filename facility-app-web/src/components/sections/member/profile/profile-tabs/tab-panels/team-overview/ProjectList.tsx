'use client';

import { MouseEvent, useMemo, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  ChipProps,
  Stack,
  Tooltip,
  Typography,
  avatarClasses,
} from '@mui/material';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { teamOverviewData } from 'data/member/profile';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';

interface ProjectListProps {
  data: (typeof teamOverviewData)['projectList'];
}

const getStatusChipColor = (status: string): ChipProps['color'] => {
  switch (status) {
    case 'Doing':
      return 'primary';
    case 'To do':
      return 'neutral';
    case 'Done':
      return 'success';
  }
};

const columnDefs: GridColDef<(typeof teamOverviewData)['projectList'][number]>[] = [
  {
    field: 'name',
    headerName: 'Project Name',
    headerClassName: 'name-header',
    cellClassName: 'name-cell',
    flex: 2.4,
    minWidth: 200,
    valueGetter: ({ name }) => name,
    renderCell: (params) => <Typography variant="body2">{params.row.name}</Typography>,
  },
  {
    field: 'team',
    headerName: 'Team',
    headerClassName: 'team-header',
    cellClassName: 'team-cell',
    flex: 1.26,
    minWidth: 100,
    valueGetter: ({ team }) => team,
    renderCell: (params) => <Typography variant="subtitle2">{params.row.team}</Typography>,
  },
  {
    field: 'collaborators',
    headerName: 'Collaborators',
    headerClassName: 'collaborators-header',
    cellClassName: 'collaborators-cell',
    sortable: false,
    filterable: false,
    flex: 1.4,
    minWidth: 130,
    renderCell: (params) => (
      <AvatarGroup
        max={5}
        sx={{
          [`& .${avatarClasses.root}`]: { width: 24, height: 24, fontSize: 12 },
        }}
      >
        {params.row.collaborators.map((collaborator) => (
          <Tooltip key={collaborator.id} title={collaborator.name}>
            <Avatar src={collaborator.avatar} sx={{ width: 24, height: 24 }} />
          </Tooltip>
        ))}
      </AvatarGroup>
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    headerClassName: 'status-header',
    cellClassName: 'status-cell',
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <Chip label={params.row.status} color={getStatusChipColor(params.row.status)} />
    ),
  },
  {
    field: 'lastOpened',
    headerName: 'Last opened',
    headerClassName: 'last-opened-header',
    cellClassName: 'last-opened-cell',
    sortable: false,
    filterable: false,
    flex: 1.26,
    minWidth: 120,
    renderCell: (params) => (
      <Typography variant="body2">{dayjs(params.row.lastOpened).fromNow()}</Typography>
    ),
  },
  {
    field: 'action',
    headerName: '',
    sortable: false,
    headerClassName: 'action-header',
    cellClassName: 'action-cell',
    width: 60,
    align: 'right',
    headerAlign: 'right',
    renderHeader: () => <DashboardMenu />,
    renderCell: () => <DashboardMenu />,
  },
];

const ProjectList = ({ data }: ProjectListProps) => {
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  const apiRef = useGridApiRef();
  const columns = useMemo(() => columnDefs, [getStatusChipColor, dayjs]);

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
      <TopSection handleToggleFilterPanel={handleToggleFilterPanel} />

      <Stack sx={{ width: 1 }}>
        <DataGrid
          apiRef={apiRef}
          columns={columns}
          rows={data}
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
                '&.name-header': {
                  paddingLeft: '24px !important',
                },
              },
            },
          }}
        />
      </Stack>
    </Stack>
  );
};

const TopSection = ({
  handleToggleFilterPanel,
}: {
  handleToggleFilterPanel: (e: MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Project List
      </Typography>
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

export default ProjectList;
