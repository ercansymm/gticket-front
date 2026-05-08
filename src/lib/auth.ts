import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10_000);

          const response = await fetch(`${process.env.API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (!response.ok) return null;

          const user = await response.json();
          return user;
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, account }) {
      // Google ile giriş
      if (account?.provider === "google") {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10_000);

          const res = await fetch(`${process.env.API_BASE_URL}/api/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              googleId: account.providerAccountId,
              email: token.email,
              name: token.name,
              picture: token.picture,
            }),
          });
          clearTimeout(timeout);

          if (res.ok) {
            const backendUser = await res.json();
            token.id = backendUser.id;
            token.accessToken = backendUser.token;
            token.role = backendUser.role;
          }
        } catch {
          // Google login backend hatası — token bilgisi olmadan devam et
        }
      }

      // Credentials ile giriş
      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.accessToken = (user as unknown as { token: string }).token;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { accessToken: string }).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
