'use client'

import { createContext, useContext } from 'react'
import { GoogleOAuthProvider as Provider } from '@react-oauth/google'

const GoogleReadyContext = createContext(false)

export function useGoogleReady() {
  return useContext(GoogleReadyContext)
}

export default function GoogleOAuthProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const isReady = Boolean(clientId && !clientId.startsWith('YOUR_'))

  if (!isReady) {
    return (
      <GoogleReadyContext.Provider value={false}>
        {children}
      </GoogleReadyContext.Provider>
    )
  }

  return (
    <GoogleReadyContext.Provider value={true}>
      <Provider clientId={clientId!}>{children}</Provider>
    </GoogleReadyContext.Provider>
  )
}