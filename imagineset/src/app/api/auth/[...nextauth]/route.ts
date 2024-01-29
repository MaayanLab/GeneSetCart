import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from '../../../../lib/prisma'
import GitHubProvider from "next-auth/providers/github";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  GitHubProvider({
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET
  })
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.id = user?.id
      }
      return token
    }, 
//     // session({ session, token}) {
//     //     // session.accessToken = token.accessToken
//     //     const id = token.sub ?? token.id
//     //     if (typeof id !== 'string') throw new Error('Missing user id')
//     //     return { ...session, user: { ...(session.user ?? {}), id: token.id ? token.id.toString() : token.sub?.toString(), }, };
//     //   },
      async session({ session, token, user }) {
        // Send properties to the client, like an access_token and user id from a provider.
        // session.accessToken = token.accessToken
        // session.user.id = token.id
        const newSession = { ...session, user: { ...(session.user ?? {}), id: user.id ? user.id.toString() : token.sub?.toString(), }, };
        return newSession
        // return session
      }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }


// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export { prisma };

