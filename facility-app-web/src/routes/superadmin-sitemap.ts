import type { MenuItem } from './sitemap';

const superadminSitemap: MenuItem[] = [
  {
    id: 'platform',
    subheader: 'Platform',
    icon: 'material-symbols:admin-panel-settings-outline-rounded',
    items: [
      {
        name: 'Overview',
        path: '/superadmin/dashboard',
        pathName: 'superadmin-dashboard',
        selectionPrefix: '/superadmin/dashboard',
        icon: 'material-symbols:dashboard-outline-rounded',
        active: true,
      },
      {
        name: 'Facilities',
        path: '/superadmin/tenants',
        pathName: 'superadmin-tenants',
        selectionPrefix: '/superadmin/tenants',
        icon: 'material-symbols:apartment-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'insights',
    subheader: 'Insights',
    icon: 'material-symbols:bar-chart-4-bars-rounded',
    items: [
      {
        name: 'Analytics',
        path: '/superadmin/analytics',
        pathName: 'superadmin-analytics',
        selectionPrefix: '/superadmin/analytics',
        icon: 'material-symbols:bar-chart-4-bars-rounded',
        active: true,
      },
      {
        name: 'Audit Log',
        path: '/superadmin/audit',
        pathName: 'superadmin-audit',
        selectionPrefix: '/superadmin/audit',
        icon: 'material-symbols:manage-search-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'manage',
    subheader: 'Manage',
    icon: 'material-symbols:settings-outline-rounded',
    items: [
      {
        name: 'Announcements',
        path: '/superadmin/announcements',
        pathName: 'superadmin-announcements',
        selectionPrefix: '/superadmin/announcements',
        icon: 'material-symbols:campaign-outline-rounded',
        active: true,
      },
      {
        name: 'Settings',
        path: '/superadmin/settings',
        pathName: 'superadmin-settings',
        selectionPrefix: '/superadmin/settings',
        icon: 'material-symbols:settings-outline-rounded',
        active: true,
      },
    ],
  },
];

export default superadminSitemap;
