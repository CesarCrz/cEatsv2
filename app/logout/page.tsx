'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  useEffect(() => {
    const logout = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      // Limpiar todo el localStorage y cookies
      localStorage.clear()
      sessionStorage.clear()
      
      // Redirigir al login
      window.location.href = '/login'
    }
    
    logout()
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Cerrando sesión...</h1>
        <p className="text-muted-foreground">Serás redirigido en un momento</p>
      </div>
    </div>
  )
}
