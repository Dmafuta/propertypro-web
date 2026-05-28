'use client';

import { createContext, use, type ReactNode } from 'react';
import defaultSitemap, { type MenuItem } from 'routes/sitemap';

const SitemapContext = createContext<MenuItem[]>(defaultSitemap);

export const SitemapProvider = ({ items, children }: { items: MenuItem[]; children: ReactNode }) => (
  <SitemapContext value={items}>{children}</SitemapContext>
);

export const useSitemap = () => use(SitemapContext);

export default SitemapProvider;
