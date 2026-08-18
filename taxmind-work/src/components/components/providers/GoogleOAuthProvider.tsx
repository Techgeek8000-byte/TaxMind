'use client'

import { GoogleOAuthProvider as Provider } from '@react-oauth/google'

export default function GoogleOAuthProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    return <>{children}</>
  }

  return <Provider clientId={clientId}>{children}</Provider>
}
