import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      designation?: string;
      userType: string;
      roles: string[];
      tenantId: string;
      tenantSlug: string;
      tenantName: string;
      primaryColour?: string;
      logoUrl?: string;
    };
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email: string;
      fullName: string;
      userType: string;
      roles: string[];
      tenantId: string;
      tenantSlug: string;
      tenantName: string;
      primaryColour?: string | null;
      logoUrl?: string | null;
    };
  }
}
