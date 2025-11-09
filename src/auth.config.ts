import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './app/lib/mongo';
import User, { IUser } from './models/user';
import { compare } from 'bcryptjs';

// Extend the built-in User type
declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    organization?: string | null;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      organization?: string | null;
    }
  }
}

// Define the user document type with password
interface IUserWithPassword extends Omit<IUser, 'password'> {
  password?: string;
}

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please provide both email and password');
          }

          await connectToDatabase();
          
          // Find user by email and include password field
          const user = await User.findOne({ email: credentials.email.toLowerCase().trim() })
            .select('+password')
            .lean()
            .exec() as IUserWithPassword | null;
          
          if (!user) {
            console.error('No user found with email:', credentials.email);
            throw new Error('Invalid email or password');
          }
          
          // Check if user has a password set
          if (!user.password) {
            console.error('No password set for user:', user.email);
            throw new Error('Please use a different sign-in method or reset your password');
          }
          
          // Compare passwords
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.error('Invalid password for user:', user.email);
            throw new Error('Invalid email or password');
          }
          
          // Return user data without the password
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            organization: user.organization?.toString()
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to the token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organization = user?.organization!!;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token data to the session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // Convert organization to string if it's an ObjectId, or keep as string/undefined
        session.user.organization = token.organization != null 
          ? String(token.organization) 
          : undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=AuthenticationError'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthOptions;
