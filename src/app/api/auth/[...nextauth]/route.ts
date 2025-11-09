// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/app/lib/mongo';
import User, { IUser } from '@/models/user';
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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter both email and password');
          }

          await connectToDatabase();
          
          // Find user by email and explicitly include the password field
          const user = await User.findOne({ email: credentials.email.toLowerCase().trim() })
            .select('+password')
            .lean()
            .exec() as IUserWithPassword | null;
          
          if (!user) {
            console.error('No user found with email:', credentials.email);
            throw new Error('Invalid email or password');
          }
          
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

          // Return only the necessary user data for the session
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
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
        if (user.role) token.role = user.role;
        if (user.organization) token.organization = user.organization;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token data to the session
      if (token) {
        session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as string;
        if (token.organization) session.user.organization = token.organization as string;
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };