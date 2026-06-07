'use client';

import { useMemo, type ReactNode } from 'react';
import SitemapProvider from 'providers/SitemapProvider';
import defaultSitemap, { type MenuItem } from 'routes/sitemap';

// ── Role → allowed nav item pathNames ─────────────────────────────────────────
// Any role not explicitly listed here gets no access to that item.
// 'Admin' and 'Manager' have full access — they are included on every item.

const ITEM_ROLES: Record<string, string[]> = {
  // Overview
  dashboard:     ['Admin', 'Manager', 'HrManager', 'Receptionist', 'Security'],
  analytics:     ['Admin', 'Manager'],
  crm:           ['Admin', 'Manager'],

  // Access Control
  'check-in':    ['Admin', 'Manager', 'Security', 'Receptionist'],
  visitors:      ['Admin', 'Manager', 'Receptionist'],
  'pre-register':['Admin', 'Manager', 'Receptionist'],
  passes:        ['Admin', 'Manager', 'Security'],
  blacklist:     ['Admin', 'Manager', 'Security'],

  // Residents
  residents:     ['Admin', 'Manager'],

  // Property
  units:         ['Admin', 'Manager'],
  'unit-types':  ['Admin', 'Manager'],
  'unit-requests':['Admin', 'Manager'],
  utilities:     ['Admin', 'Manager'],
  facilities:    ['Admin', 'Manager'],
  entrances:     ['Admin', 'Manager'],

  // Operations
  maintenance:   ['Admin', 'Manager'],
  parcels:       ['Admin', 'Manager', 'Receptionist'],
  parking:       ['Admin', 'Manager', 'Security'],
  incidents:     ['Admin', 'Manager', 'Security'],
  consumables:   ['Admin', 'Manager'],
  payments:      ['Admin', 'Manager'],

  // HR
  'hr-staff':    ['Admin', 'Manager', 'HrManager'],

  // Administration
  users:         ['Admin'],
  announcements: ['Admin', 'Manager'],
  documents:     ['Admin', 'Manager', 'HrManager'],
  reports:       ['Admin', 'Manager', 'HrManager'],
  'audit-log':   ['Admin', 'Manager'],
  settings:      ['Admin'],
};

function filterSitemap(roles: string[]): MenuItem[] {
  // If no roles or empty, show nothing (shouldn't happen in practice)
  if (!roles.length) return [];

  return defaultSitemap
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const allowed = ITEM_ROLES[item.pathName];
        // If not in map, default to Admin-only (safe default)
        if (!allowed) return roles.includes('Admin');
        return allowed.some((r) => roles.includes(r));
      }),
    }))
    .filter((section) => section.items.length > 0);
}

export function RoleFilteredSitemapLayout({
  roles,
  children,
}: {
  roles: string[];
  children: ReactNode;
}) {
  const filtered = useMemo(() => filterSitemap(roles), [roles]);
  return <SitemapProvider items={filtered}>{children}</SitemapProvider>;
}
