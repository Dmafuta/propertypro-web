import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import paths, { apiEndpoints } from 'routes/paths';
import axiosInstance from 'services/axios/axiosInstance';

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

const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? '';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials) return null;
        try {
          const data: ApiTokenResponse = await axiosInstance.post(
            apiEndpoints.login,
            { email: credentials.email, password: credentials.password },
            { headers: { 'X-Tenant-Slug': tenantSlug } },
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
          throw new Error(error?.data?.error || error?.data?.message || 'Login failed');
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
            { headers: { 'X-Tenant-Slug': tenantSlug } },
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
