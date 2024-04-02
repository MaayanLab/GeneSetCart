import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from '../prisma';
import GitHubProvider from "next-auth/providers/github";
import { revalidatePath } from 'next/cache';

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
        async session({ session, token, user }) {
          const newSession = { ...session, user: { ...(session.user ?? {}), id: user.id ? user.id.toString() : token.sub?.toString(), }, };
          return newSession
        }
    },
    pages: {
      signIn: '/api/auth/signin',
    }
  }