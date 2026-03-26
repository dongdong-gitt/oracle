import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/app/lib/db';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

const credentialsSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  code: z.string().length(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    // 手机号验证码登录
    Credentials({
      id: 'phone',
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { phone, code } = parsed.data;
        
        // TODO: 验证短信验证码
        // 这里应该调用短信服务商验证验证码
        // 暂时直接通过，实际生产需要接入阿里云/腾讯云短信
        if (code !== '123456') {
          // 生产环境：验证真实验证码
          // const isValid = await verifySmsCode(phone!, code);
          // if (!isValid) return null;
        }

        // 查找或创建用户
        let user = await prisma.user.findUnique({
          where: { phone: phone! },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: phone!,
              name: `用户${phone!.slice(-4)}`,
              membership: 'FREE',
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          membership: user.membership,
        };
      },
    }),

    // 邮箱验证码登录
    Credentials({
      id: 'email',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, code } = parsed.data;

        // TODO: 验证邮箱验证码
        if (code !== '123456') {
          return null;
        }

        let user = await prisma.user.findUnique({
          where: { email: email! },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: email!,
              name: email!.split('@')[0],
              membership: 'FREE',
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          membership: user.membership,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.membership = user.membership;
        token.phone = user.phone;
      }
      
      // 支持更新 session
      if (trigger === 'update' && session) {
        token.membership = session.membership;
        token.name = session.name;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.membership = token.membership as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
});
