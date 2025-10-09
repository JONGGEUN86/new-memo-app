// NextAuthOptions 타입을 직접 정의
type NextAuthOptions = {
  providers: Array<{
    id: string
    name: string
    type: "credentials"
    credentials: Record<string, { label: string; type: string }>
    authorize: (credentials: Record<string, string> | undefined, req: { query?: Record<string, unknown>; body?: Record<string, unknown>; headers?: Record<string, unknown>; method?: string }) => Promise<Record<string, unknown> | null>
  }>
  session: { strategy: string }
  pages: { signIn: string; signUp: string }
  callbacks: {
    jwt: (params: { token: Record<string, unknown>; user: Record<string, unknown> }) => Record<string, unknown>
    session: (params: { session: Record<string, unknown>; token: Record<string, unknown> }) => Record<string, unknown>
    redirect: (params: { url: string; baseUrl: string }) => string
  }
}
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (CredentialsProvider as any)({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async redirect({ url, baseUrl }: any) {
      // 로그아웃 후 로그인 페이지로 리다이렉트
      if (url === '/auth/signin') {
        return '/auth/signin'
      }
      return baseUrl
    }
  }
}

