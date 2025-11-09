// src/types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      organization?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    organization?: string;
  }
}