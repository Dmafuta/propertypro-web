import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5055';
const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? '';

// Simple in-memory cache: customDomain → slug (lives for the lifetime of the worker)
const domainCache = new Map<string, string>();

// Top-level path segments that are never tenant slugs
const NON_SLUG_SEGMENTS = new Set([
  'superadmin',
  'authentication',
  'api',
  '_next',
  'assets',
  'showcase',
  'pages',
  'error',
]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host') ?? '';
  const hostname = host.split(':')[0]; // strip port

  // --- Auth guards (run before custom-domain rewrite) ---

  const secret = process.env.NEXTAUTH_SECRET;

  // SuperAdmin: protect /superadmin/* except /superadmin/login
  if (
    pathname.startsWith('/superadmin') &&
    !pathname.startsWith('/superadmin/login') &&
    pathname !== '/superadmin'
  ) {
    const token = await getToken({ req, secret });
    const roles: string[] = (token?.user as any)?.roles ?? [];
    if (!token || !roles.includes('SuperAdmin')) {
      return NextResponse.redirect(new URL('/superadmin/login', req.url));
    }
  }

  // Tenant slug routes: /{slug}/* (first segment must not be a platform segment)
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const isSlugPath = !!firstSegment && !NON_SLUG_SEGMENTS.has(firstSegment);

  if (isSlugPath) {
    const slug = firstSegment;
    const rest = '/' + (segments.slice(1).join('/') || '');

    // Paths within a tenant that are publicly accessible (no auth needed)
    const isPublic =
      rest === '/' ||
      rest === '/login' ||
      rest === '/resident/login' ||
      rest === '/resident/register' ||
      rest === '/resident/forgot-password' ||
      rest === '/resident/reset-password' ||
      rest === '/forgot-password' ||
      rest === '/reset-password';

    if (!isPublic) {
      const token = await getToken({ req, secret });
      const user = token?.user as any;

      if (!token || !user) {
        // Not authenticated — send to appropriate login
        const dest = rest.startsWith('/resident/')
          ? `/${slug}/resident/login`
          : `/${slug}/login`;
        return NextResponse.redirect(new URL(dest, req.url));
      }

      // Tenant mismatch (SuperAdmin can access any tenant)
      const roles: string[] = user.roles ?? [];
      if (!roles.includes('SuperAdmin') && user.tenantSlug !== slug) {
        return NextResponse.redirect(new URL(`/${slug}/login`, req.url));
      }

      const isResident =
        user.userType === 'HomeOwner' || user.userType === 'Resident';

      if (rest.startsWith('/resident/')) {
        // Resident portal — staff members shouldn't be here
        if (!isResident && !roles.includes('SuperAdmin')) {
          return NextResponse.redirect(new URL(`/${slug}/login`, req.url));
        }
      } else {
        // Staff area — residents get redirected to their portal
        if (isResident) {
          return NextResponse.redirect(
            new URL(`/${slug}/resident/dashboard`, req.url),
          );
        }
      }
    }
  }

  // --- Custom-domain rewrite ---

  const isPlatform =
    !PLATFORM_DOMAIN ||
    hostname === 'localhost' ||
    hostname === PLATFORM_DOMAIN ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/authentication');

  if (isPlatform) return NextResponse.next();

  let slug = domainCache.get(hostname);

  if (!slug) {
    try {
      const res = await fetch(
        `${API_URL}/api/tenant/resolve?domain=${encodeURIComponent(hostname)}`,
        { cache: 'no-store' },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.slug) {
          slug = data.slug as string;
          domainCache.set(hostname, slug);
        }
      }
    } catch {
      // API unreachable — treat as platform domain and proceed normally
    }
  }

  if (slug) {
    // Rewrite: greatwallgardens.com/dashboard → internally /greatwall/dashboard
    const url = req.nextUrl.clone();
    const originalPath = url.pathname;
    url.pathname = `/${slug}${originalPath === '/' ? '' : originalPath}`;

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-is-custom-domain', 'true');
    requestHeaders.set('x-tenant-slug', slug);

    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (static assets)
     * - favicon.ico
     * - api/ (Next.js API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
