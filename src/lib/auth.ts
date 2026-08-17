import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.active) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.roleCheckedAt = Date.now();
      }
      // Re-read the role from the DB so role changes (e.g. USER → STORE_OWNER
      // after store registration) are reflected without requiring a fresh
      // login — but only at most once per ROLE_CACHE_TTL to avoid a DB hit on
      // every authenticated request. `trigger === "update"` forces an
      // immediate refresh (used by /add-store right after store registration).
      const ROLE_CACHE_TTL = 60_000; // 60s
      const stale =
        !token.roleCheckedAt || Date.now() - (token.roleCheckedAt as number) > ROLE_CACHE_TTL;
      if (token.id && (trigger === "update" || (!user && stale))) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.roleCheckedAt = Date.now();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
};
