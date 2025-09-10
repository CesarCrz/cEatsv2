"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from "lucide-react"
import { create } from "domain"

export default function DashboardRedirect(){
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const redirectToDashboard = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const supabase = createClient()
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role, sucursal_id, restaurante_id')
          .eq('id', user.id)
          .single()

        if (error || !profile){
          console.error(`Error al obtener el perfil ${error}`)
          router.push('/login')
          return 
        }

        //Redirigir según el rol
        if (profile.role === 'admin' && profile.restaurante_id){
          router.push(`/dashboard/restaurantes/${profile.restaurante_id}`)
        } else if (profile.role === 'sucursal' && profile.sucursal_id) {
          router.push(`/dashboard/sucursales/${profile.sucursal_id}`)
        } else if (profile.role === 'admin' && !profile.restaurante_id){
          router.push('/complete-profile')
        } else {
          // Caso Fallback: perfil incompleto o rol no reconocido
          console.warn(`Perfil incompleto o rol no válido ${profile}`)
          router.push('/complete-profile')
        }

      } catch (error) {
        console.error(`Error en la redirección del dashboard: ${error}`)
        router.push('/login')
      }
    }

    redirectToDashboard()

  }, [user, router])

  return(
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4"/>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}