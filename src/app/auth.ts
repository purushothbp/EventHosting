import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { connectToDatabase } from '@/app/lib/mongo';
import User, { IUser } from '@/models/user';
import Organization, { IOrganization } from '@/models/Organization';

interface IUserWithPassword extends Omit<IUser, 'password'> {
  password?: string;
}

type GoogleCredentials = {
  clientId: string;
  clientSecret: string;
};

const normalizeKey = (value?: string | null) => value?.toLowerCase().trim();

const preferredEnvKeys = () => {
  const keys = [
    process.env.APP_ENV,
    process.env.NEXT_PUBLIC_APP_ENV,
    process.env.VERCEL_ENV,
    process.env.NODE_ENV,
    'production',
    'preview',
    'development',
    'default',
  ]
    .map(normalizeKey)
    .filter(Boolean) as string[];

  return Array.from(new Set(keys));
};

const isCredentialObject = (value: any): value is GoogleCredentials =>
  Boolean(value && typeof value.clientId === 'string' && typeof value.clientSecret === 'string');

const splitCredentialPair = (value?: string | null): GoogleCredentials | null => {
  if (!value) return null;
  const [clientId, clientSecret] = value.split('|').map((segment) => segment?.trim());
  if (clientId && clientSecret) {
    return { clientId, clientSecret };
  }
  return null;
};

const getGoogleCredentials = () => {
  const raw = process.env.GOOGLE_OAUTH_CREDENTIALS;
  if (!raw) return null;

  const envKeys = preferredEnvKeys();
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  try {
    if (raw.trim().startsWith('{')) {
      const parsed = JSON.parse(raw);
      if (isCredentialObject(parsed)) {
        return parsed;
      }

      const candidates = [parsed, parsed.environments].filter(Boolean);
      for (const candidate of candidates) {
        if (candidate && typeof candidate === 'object') {
          for (const key of envKeys) {
            const match = candidate[key] || candidate[key?.toUpperCase?.() ?? ''];
            if (isCredentialObject(match)) {
              return match;
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to parse GOOGLE_OAUTH_CREDENTIALS JSON:', error);
  }

  // Support formats like "production=client|secret" per line
  for (const line of lines) {
    const [maybeKey, maybePair] = line.split('=').map((segment) => segment.trim());
    if (maybePair && envKeys.includes(normalizeKey(maybeKey)!)) {
      const creds = splitCredentialPair(maybePair);
      if (creds) return creds;
    }
  }

  // Fallback to the first pipe-delimited pair we can find
  if (lines.length) {
    for (const line of lines) {
      const pair = line.includes('=') ? line.split('=').pop() : line;
      const creds = splitCredentialPair(pair);
      if (creds) return creds;
    }
  }

  const fallback = splitCredentialPair(raw.trim());
  if (fallback) return fallback;

  return null;
};

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter both email and password');
          }

          await connectToDatabase();

          const user = await User.findOne({ email: credentials.email.toLowerCase().trim() })
            .select('+password')
            .lean()
            .exec() as IUserWithPassword | null;

          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          let organizationName: string | undefined;
          let organizationLogo: string | undefined;

          if (user.organization) {
            const organization = await Organization.findById(user.organization).lean<IOrganization | null>();
            if (organization) {
              organizationName = organization.name;
              organizationLogo = organization.logoUrl || undefined;
            }
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organization?.toString(),
            organizationName,
            organizationLogo
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      }
    })
];

const googleCreds = getGoogleCredentials();
if (googleCreds) {
  providers.push(
    GoogleProvider({
      clientId: googleCreds.clientId,
      clientSecret: googleCreds.clientSecret,
    })
  );
}

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_SECRET is not configured. Set it in your environment variables.');
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const enrichedUser = user as any;
        token.id = enrichedUser.id;
        token.role = enrichedUser.role;
        token.organization = enrichedUser.organization;
        token.organizationName = enrichedUser.organizationName;
        token.organizationLogo = enrichedUser.organizationLogo;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        if (token.organization) (session.user as any).organization = token.organization as string;
        if (token.organizationName) (session.user as any).organizationName = token.organizationName as string;
        if (token.organizationLogo) (session.user as any).organizationLogo = token.organizationLogo as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=AuthenticationError'
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === 'development',
};
