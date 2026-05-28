import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import paths, { apiEndpoints } from 'routes/paths';
import axiosInstance from 'services/axios/axiosInstance';
import { getTenantSlug } from 'services/axios/tenantSlug';

export interface FacilityUser {
  id: string;
  email: string;
  fullName: string;
  userType: string;
  roles: string[];
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  primaryColour?: string | null;
  logoUrl?: string | null;
}

export interface ApiTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: FacilityUser;
}

// Fallback demo user shown in UI when no session exists
export const demoUser = {
  id: '',
  email: 'demo@facilityapp.io',
  name: 'Guest',
  image: undefined as string | undefined,
  designation: undefined as string | undefined,
  userType: '',
  roles: [] as string[],
  tenantId: '',
  tenantSlug: '',
  tenantName: '',
};

const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5055';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email:       { label: 'Email',       type: 'text' },
        password:    { label: 'Password',    type: 'password' },
        tenantSlug:  { label: 'Tenant Slug', type: 'text' },
        staffOnly:   { label: 'Staff Only',  type: 'text' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials) return null;
        const slug      = credentials.tenantSlug ?? '';
        const staffOnly = credentials.staffOnly !== 'false'; // default to staff
        try {
          // Route to the correct endpoint. Use absolute URLs so axios doesn't
          // double-prepend the /api base path.
          let loginPath: string;
          let body: Record<string, unknown>;

          if (slug === 'platform') {
            loginPath = `${backendUrl}/api/auth/superadmin/login`;
            body = { email: credentials.email, password: credentials.password };
          } else if (!staffOnly) {
            loginPath = `${backendUrl}/api/auth/resident/login`;
            body = { slug, email: credentials.email, password: credentials.password };
          } else {
            loginPath = `${backendUrl}/api/auth/login`;
            body = { slug, email: credentials.email, password: credentials.password };
          }

          const data: any = await axiosInstance.post(loginPath, body, {
            headers: { 'X-Tenant-Slug': slug },
          });
          // 2FA required — signal the client to redirect to the OTP page
          if (data?.requiresTwoFactor) {
            throw new Error(`2FA_REQUIRED|${data.tempToken}|${data.maskedPhone}`);
          }
          const typed = data as ApiTokenResponse;
          return {
            id: typed.user.id,
            email: typed.user.email,
            name: typed.user.fullName,
            accessToken: typed.accessToken,
            refreshToken: typed.refreshToken,
            user: typed.user,
          };
        } catch (error: any) {
          // Re-throw 2FA signal as-is so Login.tsx can parse it
          const msg: string = error?.message ?? '';
          if (msg.startsWith('2FA_REQUIRED|')) throw error;
          throw new Error(error?.data?.error || error?.data?.message || 'Login failed');
        }
      },
    }),

    // Used after a successful 2FA verification — accepts pre-validated tokens from the API
    CredentialsProvider({
      id: 'verified-token',
      name: 'Verified Token',
      credentials: {
        accessToken: { label: 'Access Token', type: 'text' },
        refreshToken: { label: 'Refresh Token', type: 'text' },
        userData: { label: 'User Data', type: 'text' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.accessToken || !credentials?.userData) return null;
        try {
          const user: FacilityUser = JSON.parse(credentials.userData);
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken,
            user,
          };
        } catch {
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: 'jwt-signup',
      name: 'Jwt Signup',
      credentials: {
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials) return null;
        try {
          const data: ApiTokenResponse = await axiosInstance.post(
            apiEndpoints.register,
            { fullName: credentials.name, email: credentials.email, password: credentials.password },
            { headers: { 'X-Tenant-Slug': getTenantSlug() ?? '' } },
          );
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.fullName,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          };
        } catch (error: any) {
          throw new Error(error?.data?.error || error?.data?.message || 'Signup failed');
        }
      },
    }),
  ],

  session: {
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.user = (user as any).user;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        const u = token.user as FacilityUser;
        session.user = {
          id: u.id,
          email: u.email,
          name: u.fullName,
          userType: u.userType,
          roles: u.roles,
          tenantId: u.tenantId,
          tenantSlug: u.tenantSlug,
          tenantName: u.tenantName,
          primaryColour: u.primaryColour ?? undefined,
          logoUrl: u.logoUrl ?? undefined,
        };
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },

  pages: {
    signIn: paths.defaultJwtLogin,
    signOut: paths.defaultLoggedOut,
  },
};
