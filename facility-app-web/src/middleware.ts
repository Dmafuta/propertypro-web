import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';

// Staff sections under /[slug]/ that require authentication
const STAFF_PROTECTED = new Set([
  'dashboard', 'visitors', 'access', 'units', 'admin',
  'maintenance', 'parking', 'parcels', 'incidents',
  'facilities', 'reports', 'settings',
]);

// Superadmin pages that do NOT require auth (i.e. the login pages themselves)
const SUPERADMIN_PUBLIC = new Set(['login', '2fa']);

// Resident pages that do NOT require auth
const RESIDENT_PUBLIC = new Set(['login', 'forgot-password', 'reset-password', 'register']);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect away from Aurora's default auth demo pages — unused in this app
  if (pathname.startsWith('/authentication/')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const token = await getToken({ req });

  // ── SuperAdmin ─────────────────────────────────────────────────────────────
  if (pathname.startsWith('/superadmin/')) {
    const section = pathname.split('/')[2] ?? '';
    if (!SUPERADMIN_PUBLIC.has(section) && !token) {
      return NextResponse.redirect(new URL('/superadmin/login', req.url));
    }
    return NextResponse.next();
  }

  // ── Tenant routes: /[slug]/... ─────────────────────────────────────────────
  const parts = pathname.split('/').filter(Boolean); // ['slug', 'section', ...]
  if (parts.length >= 2) {
    const [slug, section] = parts;

    // Resident portal: /[slug]/resident/[section]
    if (section === 'resident') {
      const residentSection = parts[2] ?? '';
      if (!RESIDENT_PUBLIC.has(residentSection) && !token) {
        return NextResponse.redirect(new URL(`/${slug}/resident/login`, req.url));
      }
      return NextResponse.next();
    }

    // Staff protected sections
    if (STAFF_PROTECTED.has(section) && !token) {
      return NextResponse.redirect(new URL(`/${slug}/login`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes except Next.js internals, static assets, and backend pass-throughs
    '/((?!api|_next/static|_next/image|favicon\\.ico|uploads|documents|health|dev).*)',
  ],
};
