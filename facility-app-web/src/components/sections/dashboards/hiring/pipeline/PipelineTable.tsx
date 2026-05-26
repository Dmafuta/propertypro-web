'use client';

import { RefObject, useMemo } from 'react';
import { Link } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid/colDef';
import { gridClasses } from '@mui/x-data-grid/constants';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { GridColDef } from '@mui/x-data-grid/models';
import type { PipelineRow } from 'types/hiring';
import DashboardMenu from 'components/common/DashboardMenu';
import DataGridPagination from 'components/pagination/DataGridPagination';

interface PipelineTableProps {
  apiRef: RefObject<GridApiCommunity | null>;
  data: PipelineRow[];
}

const PipelineTable = ({ apiRef, data }: PipelineTableProps) => {
  const columns: GridColDef<PipelineRow>[] = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'jobPosition',
        headerName: 'Job Positions',
        headerClassName: 'job-position-header',
        cellClassName: 'job-position-cell',
        valueGetter: ({ title }) => title,
        minWidth: 250,
        renderCell: (params) => {
          return (
            <Stack sx={{ gap: 0.5 }}>
              <Link
                href="#!"
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'inherit',
                }}
              >
                {params.row.jobPosition.title}
              </Link>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {params.row.jobPosition.field}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'vacancy',
        headerName: 'Vacancy',
        headerClassName: 'vacancy-header',
        cellClassName: 'vacancy-cell',
        valueGetter: ({ vacancy }) => vacancy,
        minWidth: 90,
        renderCell: (params) => {
          const vacancy = params.row.vacancy;
          let vacancyStr = vacancy.toString();
          if (vacancy < 10) vacancyStr = `0${vacancy.toString()}`;

          return <Typography variant="subtitle2">{vacancyStr}</Typography>;
        },
      },
      {
        field: 'hiringManager',
        headerName: 'Hiring Manager',
        headerClassName: 'hiring-manager-header',
        cellClassName: 'hiring-manager-cell',
        minWidth: 190,
        renderCell: (params) => {
          return (
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Avatar
                src={params.row.hiringManager.avatar}
                alt={params.row.hiringManager.name}
                sx={{ width: 24, height: 24 }}
              />
              <Link
                href="#!"
                variant="subtitle2"
                sx={{
                  fontWeight: 400,
                  color: 'text.secondary',
                }}
              >
                {params.row.hiringManager.name}
              </Link>
            </Stack>
          );
        },
      },
      {
        field: 'applied',
        headerName: 'Applied',
        headerClassName: 'applied-header',
        cellClassName: 'applied-cell',
        flex: 1,
        minWidth: 125,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <Stack
              direction="row"
              sx={[
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                ({ vars }) => ({
                  width: 1,
                  height: 1,
                  borderRadius: 4,
                  bgcolor: vars.palette.chGrey[50],
                }),
              ]}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {params.row.applied || '_'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'reviewed',
        headerName: 'Reviewed',
        headerClassName: 'reviewed-header',
        cellClassName: 'reviewed-cell',
        flex: 1,
        minWidth: 125,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <Stack
              direction="row"
              sx={[
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                ({ vars }) => ({
                  width: 1,
                  height: 1,
                  borderRadius: 4,
                  bgcolor: vars.palette.chGrey[100],
                }),
              ]}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {params.row.reviewed || '_'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'mobileScreen',
        headerName: 'Mobile Screen',
        headerClassName: 'mobile-screen-header',
        cellClassName: 'mobile-screen-cell',
        flex: 1,
        minWidth: 125,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <Stack
              direction="row"
              sx={[
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                ({ vars }) => ({
                  width: 1,
                  height: 1,
                  borderRadius: 4,
                  bgcolor: vars.palette.chBlue[50],
                }),
              ]}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {params.row.mobileScreen || '_'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'interview',
        headerName: 'Interview',
        headerClassName: 'interview-header',
        cellClassName: 'interview-cell',
        flex: 1,
        minWidth: 125,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <Stack
              direction="row"
              sx={[
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                ({ vars }) => ({
                  width: 1,
                  height: 1,
                  borderRadius: 4,
                  bgcolor: vars.palette.chBlue[100],
                }),
              ]}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {params.row.interview || '_'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'offer',
        headerName: 'Offer',
        headerClassName: 'offer-header',
        cellClassName: 'offer-cell',
        flex: 1,
        minWidth: 125,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <Stack
              direction="row"
              sx={[
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                ({ vars }) => ({
                  width: 1,
                  height: 1,
                  borderRadius: 4,
                  bgcolor: vars.palette.chLightBlue[50],
                }),
              ]}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {params.row.offer || '_'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'hired',
        headerName: 'Hired',
        headerClassName: 'hired-header',
        cellClassName: 'hired-cell',
        flex: 1,
        minWidth: 125,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <Stack
              direction="row"
              sx={[
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                ({ vars }) => ({
                  width: 1,
                  height: 1,
                  borderRadius: 4,
                  bgcolor: vars.palette.chGreen[100],
                }),
              ]}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {params.row.hired || '_'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'rejected',
        headerName: 'Rejected',
        headerClassName: 'rejected-header',
        cellClassName: 'rejected-cell',
        flex: 1,
        minWidth: 125,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          return (
            <Stack
              direction="row"
              sx={[
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                ({ vars }) => ({
                  width: 1,
                  height: 1,
                  borderRadius: 4,
                  bgcolor: vars.palette.chRed[100],
                }),
              ]}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {params.row.rejected || '_'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: 'action',
        headerName: '',
        headerClassName: 'action-header',
        cellClassName: 'action-cell',
        sortable: false,
        width: 60,
        align: 'right',
        headerAlign: 'right',
        renderCell: () => <DashboardMenu />,
      },
    ],
    [],
  );

  return (
    <Stack sx={{ width: '100%' }}>
      <DataGrid
        rowHeight={64}
        rows={data}
        apiRef={apiRef}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 7,
            },
          },
        }}
        pageSizeOptions={[7, data.length]}
        checkboxSelection
        slots={{
          basePagination: (props) => (
            <DataGridPagination showFullPagination showAllHref="#!" {...props} />
          ),
        }}
        sx={({ spacing }) => ({
          [`& .${gridClasses.columnHeaders}`]: {
            [`& .${gridClasses.columnHeader}`]: {
              '&:not(.action-header)': {
                p: `0 ${spacing(1.25)}`,
              },
              '&.action-header': {
                pl: spacing(1.25),
              },
            },
          },
          [`& .${gridClasses.row}`]: {
            [`& .${gridClasses.cell}`]: {
              '&.aurora-data-grid-cell': {
                '&:not(.action-cell)': {
                  p: `${spacing(1)} ${spacing(1.25)}`,
                },
                '&.action-cell': {
                  pl: spacing(1.25),
                },
              },
            },
          },
        })}
      />
    </Stack>
  );
};

export default PipelineTable;
