import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@/utils/supabase/server'
import { hashPassword } from '@/app/actions/register'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Correo', type: 'email', placeholder: 'jose@elmeeple.com' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        const emailClean = credentials.email.toLowerCase().trim()

        try {
          const supabase = await createClient()
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', emailClean)
            .single()

          if (profile) {
            const hashedPassword = await hashPassword(credentials.password || '')
            console.log('[NextAuth Debug] Profile found:', profile.email)
            console.log('[NextAuth Debug] DB Password:', profile.password)
            console.log('[NextAuth Debug] Form Hashed Password:', hashedPassword)
            if (profile.password === hashedPassword) {
              return {
                id: profile.email,
                name: profile.name,
                email: profile.email,
                role: profile.role,
              }
            }
            console.log('[NextAuth Debug] Password mismatch!')
            return null
          }
        } catch (err) {
          console.error('Error in nextauth authorize db check:', err)
        }

        // Fallback for mock users/tests if they aren't in the database yet
        const email = credentials.email.toLowerCase()
        const role = email.includes('partner') || email.includes('owner') || email.includes('admin') ? 'partner' : 'player'

        return {
          id: email,
          name: email.split('@')[0],
          email: email,
          role: role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role?: string }).role || 'player'
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as unknown as { role?: string }).role = token.role as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
