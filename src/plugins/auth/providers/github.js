import GitHubAuthProvider from '@auth/core/providers/github'

export const GitHub = GitHubAuthProvider({
  clientId: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET
})
