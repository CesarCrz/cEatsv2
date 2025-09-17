import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  
  const { profile } = useAuth()
  const supabase = createClient()

  const loadSubscriptionData = async () => {
    if (!profile?.restaurante_id) return

    try {
      setIsLoading(true)
      setError(null)

      // 1. Obtener suscripción actual
      const { data: subscriptionData, error: subError } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('restaurante_id', profile.restaurante_id)
        .eq('status', 'active')
        .single()

      if (subError && subError.code !== 'PGRST116') { // PGRST116 = No rows found
        throw subError
      }

      // Si no tiene suscripción, usar plan trial por defecto
      const currentPlan = subscriptionData?.plan_type || 'trial'
      setSubscription(subscriptionData)

      // 2. Obtener límites del plan actual
      const { data: configData, error: configError } = await supabase
        .from('configuraciones_sistema')
        .select('valor')
        .eq('clave', 'planes_limites')
        .single()

      if (configError) throw configError

      const planesLimites = configData.valor as Record<string, PlanConfig>
      setAllPlans(planesLimites)
      setLimits(planesLimites[currentPlan])

      // 3. Obtener uso actual del mes
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01' // '2024-01-01'
      
      const { data: usageData, error: usageError } = await supabase
        .from('uso_restaurantes')
        .select('*')
        .eq('restaurante_id', profile.restaurante_id)
        .eq('periodo_mes', currentMonth)
        .single()

      if (usageError && usageError.code !== 'PGRST116') {
        throw usageError
      }

      // Si no existe registro de uso, crear uno
      if (!usageData) {
        const { data: newUsage } = await supabase
          .from('uso_restaurantes')
          .insert({
            restaurante_id: profile.restaurante_id,
            periodo_mes: currentMonth,
            sucursales_activas: 0,
            pedidos_procesados: 0
          })
          .select()
          .single()
        
        setUsage(newUsage || { sucursales_activas: 0, pedidos_procesados: 0 })
      } else {
        setUsage(usageData)
      }

    } catch (err) {
      console.error('Error cargando datos de suscripción:', err)
      setError('Error al cargar información de suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.restaurante_id) {
      loadSubscriptionData()
    }
  }, [profile])

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