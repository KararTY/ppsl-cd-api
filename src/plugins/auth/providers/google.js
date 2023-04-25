import GoogleAuthProvider from '@auth/core/providers/google'

export const Google = GoogleAuthProvider({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET
})
