import { SxProps } from '@mui/material';
import { facilityPaths } from './paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  key?: string;
  selectionPrefix?: string;
  path?: string | ((slug: string) => string);
  active?: boolean;
  icon?: string;
  iconSx?: SxProps;
  items?: SubMenuItem[];
  new?: boolean;
  hasNew?: boolean;
}

export interface MenuItem {
  id: string;
  key?: string;
  subheader: string;
  icon: string;
  iconSx?: SxProps;
  items: SubMenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 'overview',
    subheader: 'Overview',
    icon: 'material-symbols:dashboard-outline-rounded',
    items: [
      {
        name: 'Dashboard',
        path: facilityPaths.dashboard,
        pathName: 'dashboard',
        selectionPrefix: '/dashboard',
        icon: 'material-symbols:dashboard-outline-rounded',
        active: true,
      },
      {
        name: 'Analytics',
        path: facilityPaths.dashboardAnalytics,
        pathName: 'analytics',
        selectionPrefix: '/dashboard/analytics',
        icon: 'material-symbols:bar-chart-4-bars-rounded',
        active: true,
      },
      {
        name: 'CRM',
        path: facilityPaths.dashboardCrm,
        pathName: 'crm',
        selectionPrefix: '/dashboard/crm',
        icon: 'material-symbols:people-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'access',
    subheader: 'Access Control',
    icon: 'material-symbols:door-front-outline-rounded',
    items: [
      {
        name: 'Check-in',
        path: facilityPaths.checkIn,
        pathName: 'check-in',
        selectionPrefix: '/access/check-in',
        icon: 'material-symbols:how-to-reg-outline-rounded',
        active: true,
      },
      {
        name: 'Visitors',
        path: facilityPaths.visitors,
        pathName: 'visitors',
        selectionPrefix: '/visitors',
        icon: 'material-symbols:group-outline-rounded',
        active: true,
      },
      {
        name: 'Pre-register',
        path: facilityPaths.visitorsPreRegister,
        pathName: 'pre-register',
        icon: 'material-symbols:person-add-outline-rounded',
        active: true,
      },
      {
        name: 'Passes',
        path: facilityPaths.passes,
        pathName: 'passes',
        icon: 'material-symbols:badge-outline-rounded',
        active: true,
      },
      {
        name: 'Blacklist',
        path: facilityPaths.blacklist,
        pathName: 'blacklist',
        icon: 'material-symbols:block-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'property',
    subheader: 'Property',
    icon: 'material-symbols:apartment-outline-rounded',
    items: [
      {
        name: 'Units',
        path: facilityPaths.units,
        pathName: 'units',
        icon: 'material-symbols:meeting-room-outline-rounded',
        active: true,
      },
      {
        name: 'Unit Types',
        path: facilityPaths.unitTypes,
        pathName: 'unit-types',
        icon: 'material-symbols:category-outline-rounded',
        active: true,
      },
      {
        name: 'Unit Requests',
        path: facilityPaths.unitRequests,
        pathName: 'unit-requests',
        icon: 'material-symbols:assignment-outline-rounded',
        active: true,
      },
      {
        name: 'Facilities',
        path: facilityPaths.facilities,
        pathName: 'facilities',
        icon: 'material-symbols:location-city-rounded',
        active: true,
      },
      {
        name: 'Entrances',
        path: facilityPaths.entrances,
        pathName: 'entrances',
        icon: 'material-symbols:sensor-door-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'operations',
    subheader: 'Operations',
    icon: 'material-symbols:settings-outline-rounded',
    items: [
      {
        name: 'Maintenance',
        path: facilityPaths.maintenance,
        pathName: 'maintenance',
        icon: 'material-symbols:build-outline-rounded',
        active: true,
      },
      {
        name: 'Parcels',
        path: facilityPaths.parcels,
        pathName: 'parcels',
        icon: 'material-symbols:package-2-outline-rounded',
        active: true,
      },
      {
        name: 'Parking',
        path: facilityPaths.parking,
        pathName: 'parking',
        icon: 'material-symbols:local-parking-rounded',
        active: true,
      },
      {
        name: 'Incidents',
        path: facilityPaths.incidents,
        pathName: 'incidents',
        icon: 'material-symbols:warning-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'hr',
    subheader: 'Human Resources',
    icon: 'material-symbols:badge-outline-rounded',
    items: [
      {
        name: 'Staff Directory',
        path: facilityPaths.hrStaff,
        pathName: 'hr-staff',
        selectionPrefix: '/hr/staff',
        icon: 'material-symbols:badge-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'administration',
    subheader: 'Administration',
    icon: 'material-symbols:admin-panel-settings-outline-rounded',
    items: [
      {
        name: 'Users',
        path: facilityPaths.users,
        pathName: 'users',
        icon: 'material-symbols:manage-accounts-outline',
        active: true,
      },
      {
        name: 'Announcements',
        path: facilityPaths.announcements,
        pathName: 'announcements',
        icon: 'material-symbols:campaign-outline-rounded',
        active: true,
      },
      {
        name: 'Documents',
        path: facilityPaths.documents,
        pathName: 'documents',
        icon: 'material-symbols:description-outline-rounded',
        active: true,
      },
      {
        name: 'Reports',
        path: facilityPaths.reports,
        pathName: 'reports',
        icon: 'material-symbols:bar-chart-4-bars-rounded',
        active: true,
      },
      {
        name: 'Audit Log',
        path: facilityPaths.auditLog,
        pathName: 'audit-log',
        icon: 'material-symbols:history-rounded',
        active: true,
      },
      {
        name: 'Settings',
        path: facilityPaths.settings,
        pathName: 'settings',
        icon: 'material-symbols:tune-rounded',
        active: true,
      },
    ],
  },
];

export default sitemap;
