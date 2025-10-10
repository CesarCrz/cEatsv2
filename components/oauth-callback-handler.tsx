'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export function OAuthCallbackHandler() {
  const searchParams = useSearchParams()
  const hasRedirected = useRef(false)
  
  useEffect(() => {
    const code = searchParams.get('code')
    
    // Solo redirigir si hay código y no hemos redirigido ya
    if (code && !hasRedirected.current) {
      hasRedirected.current = true
      // Redirigir al callback de OAuth
      window.location.href = `/api/auth/callback?code=${code}`
    }
  }, [searchParams])
  
  return null
}
