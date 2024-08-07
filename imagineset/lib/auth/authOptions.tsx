import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from '../prisma';
import KeycloakProvider from 'next-auth/providers/keycloak'

const KEYCLOAK_PROVIDER_INFO = process.env.NEXTAUTH_KEYCLOAK!

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [ 
    KeycloakProvider({...JSON.parse(KEYCLOAK_PROVIDER_INFO)})

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