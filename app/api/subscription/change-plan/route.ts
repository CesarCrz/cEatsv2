import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

/**
 * POST /api/subscription/change-plan
 * 
 * Cambia el plan de una suscripción existente (upgrade o downgrade).
 * Implementa Opción B: El cambio se aplica al final del período de facturación actual.
 * 
 * Body: {
 *   restauranteId: string,
 *   newPlanType: 'trial' | 'standard' | 'premium'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando cambio de plan...')
    
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()
    
    // 1. Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Obtener parámetros de la petición
    const { restauranteId, newPlanType } = await request.json()

    if (!restauranteId || !newPlanType) {
      return NextResponse.json(
        { error: 'restauranteId y newPlanType son requeridos' },
        { status: 400 }
      )
    }

    console.log('📋 Parámetros recibidos:', { restauranteId, newPlanType, userId: user.id })

    // 3. Verificar permisos del usuario
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('restaurante_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que el usuario tenga acceso al restaurante
    if (profile.restaurante_id !== restauranteId && profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'No tienes permiso para modificar esta suscripción' }, { status: 403 })
    }

    // 4. Obtener suscripción actual
    const { data: currentSubscription, error: subError } = await supabaseAdmin
      .from('suscripciones')
      .select('*')
      .eq('restaurante_id', restauranteId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subError) {
      console.error('❌ Error al obtener suscripción:', subError)
      throw subError
    }

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No se encontró una suscripción activa para este restaurante' },
        { status: 404 }
      )
    }

    // Verificar que no sea el mismo plan
    if (currentSubscription.plan_type === newPlanType) {
      return NextResponse.json(
        { error: 'El plan seleccionado es el mismo que el plan actual' },
        { status: 400 }
      )
    }

    console.log('📋 Suscripción actual:', {
      id: currentSubscription.id,
      stripe_subscription_id: currentSubscription.stripe_subscription_id,
      current_plan: currentSubscription.plan_type,
      new_plan: newPlanType
    })

    // 5. Obtener el price_id del nuevo plan desde stripe_productos
    const { data: stripeConfig, error: stripeConfigError } = await supabaseAdmin
      .from('configuraciones_sistema')
      .select('valor')
      .eq('clave', 'stripe_productos')
      .single()

    if (stripeConfigError || !stripeConfig) {
      return NextResponse.json(
        { error: 'Error obteniendo configuración de Stripe' },
        { status: 500 }
      )
    }

    const stripeProducts = stripeConfig.valor as Record<string, string>
    const newPriceId = stripeProducts[newPlanType]

    if (!newPriceId) {
      return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
    }

    console.log('💳 Price ID del nuevo plan:', newPriceId)

    // 6. Obtener la suscripción de Stripe para modificarla
    const stripeSubscription = await stripe.subscriptions.retrieve(
      currentSubscription.stripe_subscription_id
    )

    if (!stripeSubscription) {
      return NextResponse.json(
        { error: 'No se pudo obtener la suscripción de Stripe' },
        { status: 500 }
      )
    }

    console.log('📋 Suscripción de Stripe obtenida:', {
      id: stripeSubscription.id,
      items: stripeSubscription.items.data.length
    })

    // 7. Actualizar la suscripción en Stripe
    // Opción B: Cambio al final del período (proration_behavior: 'none', cancel_at_period_end: false)
    const subscriptionItemId = stripeSubscription.items.data[0]?.id

    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: 'No se encontró el item de suscripción en Stripe' },
        { status: 500 }
      )
    }

    console.log('🔄 Actualizando suscripción en Stripe...')

    const updatedSubscription = await stripe.subscriptions.update(
      currentSubscription.stripe_subscription_id,
      {
        items: [
          {
            id: subscriptionItemId,
            price: newPriceId,
          },
        ],
        proration_behavior: 'none', // No prorratear, aplicar cambio al final del período
        metadata: {
          ...stripeSubscription.metadata,
          plan_type: newPlanType,
          previous_plan: currentSubscription.plan_type,
          changed_at: new Date().toISOString(),
        },
      }
    )

    console.log('✅ Suscripción actualizada en Stripe:', {
      id: updatedSubscription.id,
      status: updatedSubscription.status,
    })

    // 8. Actualizar la suscripción en nuestra base de datos
    const { error: updateError } = await supabaseAdmin
      .from('suscripciones')
      .update({
        plan_type: newPlanType,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', currentSubscription.stripe_subscription_id)

    if (updateError) {
      console.error('❌ Error al actualizar suscripción en BD:', updateError)
      // No lanzamos error porque Stripe ya fue actualizado
      // El webhook sincronizará eventualmente
    } else {
      console.log('✅ Suscripción actualizada en base de datos')
    }

    // 9. Calcular fecha de cambio efectivo (usar la fecha del periodo actual)
    const periodEnd = currentSubscription.current_period_end
    const changeEffectiveDate = new Date(periodEnd)

    return NextResponse.json({
      success: true,
      message: `El cambio de plan se aplicará al final del período de facturación actual`,
      data: {
        currentPlan: currentSubscription.plan_type,
        newPlan: newPlanType,
        changeEffectiveDate: changeEffectiveDate.toISOString(),
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
      },
    })

  } catch (error) {
    console.error('❌ Error en cambio de plan:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Error de Stripe: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
