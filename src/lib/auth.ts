import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";

const googleOAuthConfigured = isGoogleOAuthConfigured();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/en/login",
  },
  providers: [
    ...(googleOAuthConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            /**
             * Link Google sign-in to an existing credentials user when emails match.
             * Google OIDC returns email_verified; treat that as proof of mailbox control.
             */
            allowDangerousEmailAccountLinking: true,
            authorization: {
              params: {
                scope: "openid email profile",
              },
            },
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.password) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  events: {
    async signIn({ user, account, isNewUser }) {
      if (!isNewUser || account?.provider !== "google" || !user.id) {
        return;
      }

      const cookieStore = await cookies();
      const locale = cookieStore.get("NEXT_LOCALE")?.value;
      if (locale !== "en" && locale !== "fr") {
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { language: locale },
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { passwordChangedAt: true },
        });
        token.passwordChangedAt =
          dbUser?.passwordChangedAt?.getTime() ?? 0;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { passwordChangedAt: true },
        });
        const current = dbUser?.passwordChangedAt?.getTime() ?? 0;
        const issued = (token.passwordChangedAt as number | undefined) ?? 0;
        if (current !== issued) {
          token.sessionInvalidated = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sessionInvalidated) {
        return { ...session, user: undefined, expires: new Date(0).toISOString() };
      }
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
