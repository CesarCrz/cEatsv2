import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching subscription data...')
    const { searchParams } = new URL(request.url)
    const restauranteId = searchParams.get('restauranteId')

    if (!restauranteId) {
      return NextResponse.json({ error: 'restauranteId requerido' }, { status: 400 })
    }

    // Verificar autenticación
    const cookieStore = cookies()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // 1. Obtener suscripción
    const { data: subscriptionData, error: subError } = await supabaseAdmin
      .from('suscripciones')
      .select('*')
      .eq('restaurante_id', restauranteId)
      .eq('status', 'active')
      .single()

    if (subError && subError.code !== 'PGRST116') throw subError

    const currentPlan = subscriptionData?.plan_type || 'trial'

    // 2. Obtener límites de planes
    const { data: configData, error: configError } = await supabaseAdmin
      .from('configuraciones_sistema')
      .select('valor')
      .eq('clave', 'planes_limites')
      .single()

    if (configError) throw configError

    const planesLimites = configData.valor

    // 3. Obtener uso actual
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
    
    let { data: usageData, error: usageError } = await supabaseAdmin
      .from('uso_restaurantes')
      .select('*')
      .eq('restaurante_id', restauranteId)
      .eq('periodo_mes', currentMonth)
      .single()

    if (usageError && usageError.code !== 'PGRST116') throw usageError

    // Crear registro de uso si no existe
    if (!usageData) {
      const { data: newUsage } = await supabaseAdmin
        .from('uso_restaurantes')
        .insert({
          restaurante_id: restauranteId,
          periodo_mes: currentMonth,
          sucursales_activas: 0,
          pedidos_procesados: 0
        })
        .select()
        .single()
      
      usageData = newUsage || { sucursales_activas: 0, pedidos_procesados: 0 }
    }

    const data = {
        subscription: subscriptionData,
        limits: planesLimites[currentPlan],
        usage: usageData,
        allPlans: planesLimites
    }
    
    console.log(`informacion de suscripción para restauranteId ${restauranteId}:`, data)

    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    console.error('Error obteniendo datos de suscripción:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}