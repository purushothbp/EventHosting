import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows redirecting to the dashboard after a successful login
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard/events`;
      }
      // Allows relative callback URLs
      else if (url.startsWith('/')) {
        return new URL(url, baseUrl).toString();
      }
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
