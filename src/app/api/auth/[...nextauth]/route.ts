import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import { verifyOneTimeCode } from '@/server/auth/code';

const phoneCredentialsSchema = z.object({
  phone: z.string().min(3),
  code: z.string().length(6),
});

const emailCredentialsSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const nextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    Credentials({
      id: 'phone',
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = phoneCredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { phone, code } = parsed.data;
        if (!verifyOneTimeCode(code)) return null;

        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              phone,
              name: `用户${phone.slice(-4)}`,
              membership: 'FREE',
            },
          });
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          phone: user.phone ?? undefined,
          membership: user.membership,
          role: user.role,
          isGuest: user.isGuest,
        };
      },
    }),
    Credentials({
      id: 'email',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = emailCredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, code } = parsed.data;
        if (!verifyOneTimeCode(code)) return null;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split('@')[0],
              membership: 'FREE',
            },
          });
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          phone: user.phone ?? undefined,
          membership: user.membership,
          role: user.role,
          isGuest: user.isGuest,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.membership = (user as any).membership;
        token.phone = (user as any).phone;
        token.role = (user as any).role;
        token.isGuest = (user as any).isGuest;
      }

      if (trigger === 'update' && session) {
        token.membership = (session as any).membership;
        token.name = session.name;
        token.role = (session as any).role ?? token.role;
        token.isGuest = (session as any).isGuest ?? token.isGuest;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).membership = token.membership as string;
        (session.user as any).phone = token.phone as string;
        (session.user as any).role = token.role as string;
        (session.user as any).isGuest = Boolean(token.isGuest);
      }
      return session;
    },
  },
});

export const { auth, signIn, signOut } = nextAuthResult;
export const {
  handlers: { GET, POST },
} = nextAuthResult;
