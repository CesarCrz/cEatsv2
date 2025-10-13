interface PlanLimits {
  nombre_display: string
  precio: number
  descripcion: string
  max_pedidos: number | string
  max_sucursales: number | string
  caracteristicas: Array<{
    texto: string
    incluido: boolean
  }>
  popular?: boolean
  recomendado?: boolean
}

interface PlansConfig {
  [key: string]: PlanLimits
}

/**
 * Obtiene la información de un plan específico desde la configuración
 */
export async function getPlanInfo(planType: string): Promise<PlanLimits | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/subscription/plans`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Error al obtener planes')
    }

    const { plans } = await response.json() as { plans: PlansConfig }
    return plans[planType] || null
  } catch (error) {
    console.error('Error obteniendo información del plan:', error)
    return null
  }
}

/**
 * Obtiene todos los planes disponibles desde la configuración
 */
export async function getAllPlans(): Promise<PlansConfig> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/subscription/plans`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Error al obtener planes')
    }

    const { plans } = await response.json() as { plans: PlansConfig }
    return plans
  } catch (error) {
    console.error('Error obteniendo planes:', error)
    return {}
  }
}

/**
 * Mapea un Price ID de Stripe al tipo de plan correspondiente
 * Usa las variables de entorno configuradas
 */
export function mapPriceIdToPlanType(priceId: string): string {
  const priceMap: { [key: string]: string } = {
    [process.env.NEXT_PUBLIC_STRIPE_TRIAL_PRICE_ID || '']: 'trial',
    [process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || '']: 'standard',
    [process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || '']: 'premium',
  }
  
  return priceMap[priceId] || 'trial'
}
