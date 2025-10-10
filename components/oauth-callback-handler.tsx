'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function OAuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const code = searchParams.get('code')
    
    if (code) {
      // Redirigir al callback de OAuth
      window.location.href = `/api/auth/callback?code=${code}`
    }
  }, [searchParams])
  
  return null
}
