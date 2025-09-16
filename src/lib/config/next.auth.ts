import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { api } from "../api"
import EmailProvider from "next-auth/providers/nodemailer"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: { email: { label: "Email" }, password: { label: "Password", type: "password" } },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null
        const res = await api.login(JSON.parse(JSON.stringify({ email: creds.email, password: creds.password })));
        if (!res.success) return null
        return {
          id: res.data?.id,
        }
      },
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id
      return token
    },
    async session({ session, token }) {
      if (token?.userId && session.user) {
        (session.user as { id?: string }).id = token.userId as string
      }
      return session
    },
  },
})
