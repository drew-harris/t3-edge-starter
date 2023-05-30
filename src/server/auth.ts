import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { SignJWT, jwtVerify } from "jose";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    // ...other properties
    // role: UserRole;
    id: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt(params) {
      // Add id to jwt
      // console.log("jwt user", params);
      if (params.user) {
        console.log("new user?", params.user);
        params.token.id = params.user.id;
      }
      return params.token;
    },
    session: ({ session, token }) => {
      // session.user.id = user.id;
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
  },

  jwt: {
    encode(params) {
      const iat = Math.floor(Date.now() / 1000);
      const exp = iat + 60 * 60; // one hour

      return new SignJWT({ ...params.token })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        .setNotBefore(iat)
        .sign(new TextEncoder().encode(env.NEXTAUTH_SECRET));
    },

    async decode(params) {
      if (!params.token) {
        return null;
      }
      const { payload } = await jwtVerify(
        params.token,
        new TextEncoder().encode(env.NEXTAUTH_SECRET)
      );

      return payload;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    // INSERT PROVIDERS HERE
    // GoogleProvider({
    //   clientId: env.GOOGLE_CLIENT_ID,
    //   clientSecret: env.GOOGLE_CLIENT_SECRET,
    // }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
