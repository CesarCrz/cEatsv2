import { useState, useEffect } from 'react'
import { useAuth } from './use-auth'

interface PlanLimits {
  max_sucursales: number | 'unlimited'
  max_pedidos: number | 'unlimited'
  nombre_display: string
  precio: number
}

interface PlanFeature {
  texto: string
  incluido: boolean
}

interface PlanConfig {
  precio: number
  max_pedidos: number | 'unlimited'
  max_sucursales: number | 'unlimited'
  nombre_display: string
  descripcion?: string
  caracteristicas?: PlanFeature[]
  popular?: boolean
  recomendado?: boolean
}

interface Subscription {
  id: string
  plan_type: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
}

interface Usage {
  sucursales_activas: number
  pedidos_procesados: number
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [allPlans, setAllPlans] = useState<Record<string, PlanConfig> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { profile, user } = useAuth()
  // ✅ ELIMINADO: const supabase = createServiceRoleClient()

  const loadSubscriptionData = async () => {
    // ✅ Verificar autenticación primero
    if (!user) {
      setIsLoading(false)
      setError('Usuario no autenticado')
      return
    }

    // ✅ Si no hay restaurante, solo cargar planes públicos
    if (!profile?.restaurante_id) {
      console.log(`información del perfil del usuario:`, profile)
      console.log(`informacion del usuario ${JSON.stringify(user)}`)
      console.log('No se encontró restaurante_id, cargando planes públicos...')
      try {
        setIsLoading(true)
        setError(null)

        // Usar endpoint para obtener planes públicos
        const response = await fetch('/api/subscription/plans')
        if (!response.ok) throw new Error('Error obteniendo planes')
        
        const { plans } = await response.json()
        setAllPlans(plans)
        
        // Plan trial por defecto
        setLimits(plans['trial'])
        setSubscription(null)
        setUsage({ sucursales_activas: 0, pedidos_procesados: 0 })
        
      } catch (err) {
        console.error('Error cargando planes:', err)
        setError('Error al cargar planes disponibles')
      } finally {
        setIsLoading(false)
      }
      return
    }

    // ✅ Para usuarios con restaurante, usar endpoint
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/subscription/data?restauranteId=${profile.restaurante_id}`, {
        method: 'GET',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Error obteniendo datos de suscripción')
      }

      const data = await response.json()
      
      setSubscription(data.subscription)
      setLimits(data.limits)
      setUsage(data.usage)
      setAllPlans(data.allPlans)

    } catch (err) {
      console.error('Error cargando datos de suscripción:', err)
      setError('Error al cargar información de suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptionData()
  }, [profile, user])

  // Funciones de utilidad
  const canCreateSucursal = () => {
    if (!limits || !usage) return false
    if (limits.max_sucursales === 'unlimited') return true
    return usage.sucursales_activas < limits.max_sucursales
  }

  const canProcessOrder = () => {
    if (!limits || !usage) return false
    if (limits.max_pedidos === 'unlimited') return true
    return usage.pedidos_procesados < limits.max_pedidos
  }

  const getRemainingQuota = (type: 'sucursales' | 'pedidos') => {
    if (!limits || !usage) return 0
    
    if (type === 'sucursales') {
      if (limits.max_sucursales === 'unlimited') return 'unlimited'
      return Math.max(0, limits.max_sucursales - usage.sucursales_activas)
    } else {
      if (limits.max_pedidos === 'unlimited') return 'unlimited'
      return Math.max(0, limits.max_pedidos - usage.pedidos_procesados)
    }
  }

  return {
    subscription,
    limits,
    usage,
    allPlans,
    isLoading,
    error,
    canCreateSucursal,
    canProcessOrder,
    getRemainingQuota,
    refetch: loadSubscriptionData
  }
}