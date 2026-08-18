import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "imam@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const params = new URLSearchParams()
          params.append("username", credentials.email as string)
          params.append("password", credentials.password as string)

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString()
          })

          if (!res.ok) {
            return null
          }

          const data = await res.json()
          
          if (data.access_token) {
            const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
              headers: { "Authorization": `Bearer ${data.access_token}` }
            })
            
            if (meRes.ok) {
              const me = await meRes.json()
              return {
                id: me.sub,
                email: me.email,
                role: me.role,
                tenant_id: me.tenant_id,
                accessToken: data.access_token
              }
            }
          }
          return null
        } catch (e) {
          console.error("Auth error:", e)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.tenant_id = user.tenant_id
        token.id = user.id
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.tenant_id = token.tenant_id as string
        session.user.id = token.id as string
        session.accessToken = token.accessToken as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
})
