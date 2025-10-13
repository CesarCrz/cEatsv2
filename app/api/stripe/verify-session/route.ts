import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { sendCustomEmail } from '@/lib/email/sender'
import { getSubscriptionConfirmationTemplate, getWelcomeSubscriptionTemplate } from '@/lib/email/templates'
import { getPlanInfo, mapPriceIdToPlanType } from '@/lib/subscription/get-plan-info'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Recuperar la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        error: 'Payment not completed',
        status: session.payment_status,
      })
    }

    const supabase = createServiceRoleClient()
    const restauranteId = session.metadata?.restaurante_id

    if (!restauranteId) {
      return NextResponse.json(
        { success: false, error: 'No se encontró restaurante_id' },
        { status: 400 }
      )
    }

    // Verificar si ya existe la suscripción
    const { data: existingSub } = await supabase
      .from('suscripciones')
      .select('id')
      .eq('stripe_subscription_id', session.subscription as string)
      .single()

    // Si no existe, crearla (respaldo del webhook)
    if (!existingSub && session.subscription) {
      console.log('⚠️ Suscripción no encontrada, creando desde verify-session (respaldo del webhook)')

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ['items.data.price.product'],
      }) as any

      const priceId = subscription.items.data[0].price.id
      const planType = mapPriceIdToPlanType(priceId)

      console.log('📋 Creando suscripción desde verify-session:', {
        priceId,
        planType,
        restauranteId
      })

      // Obtener información del restaurante y usuario
      const { data: restaurante } = await supabase
        .from('restaurantes')
        .select('nombre, user_id')
        .eq('id', restauranteId)
        .single()

      let userEmail = null
      let userName = 'Usuario'

      if (restaurante?.user_id) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('email, nombre')
          .eq('id', restaurante.user_id)
          .single()

        if (userProfile) {
          userEmail = userProfile.email
          userName = userProfile.nombre || 'Usuario'
        }
      }

      const { error: insertError } = await supabase
        .from('suscripciones')
        .insert({
          restaurante_id: restauranteId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('❌ Error al insertar suscripción:', insertError)
      } else {
        console.log('✅ Suscripción creada desde verify-session')

        // Enviar correos de confirmación
        if (userEmail) {
          // Obtener información dinámica del plan
          const planInfo = await getPlanInfo(planType)

          if (planInfo) {
            const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })

            const features = planInfo.caracteristicas
              .filter(c => c.incluido)
              .map(c => c.texto)

            try {
              const confirmationTemplate = getSubscriptionConfirmationTemplate(
                planInfo.nombre_display,
                planInfo.precio === 0 ? 'Gratis' : `$${planInfo.precio}/mes`,
                nextBillingDate,
                features,
              )

              await sendCustomEmail(userEmail, confirmationTemplate)

              const welcomeTemplate = getWelcomeSubscriptionTemplate(userName, planInfo.nombre_display)
              await sendCustomEmail(userEmail, welcomeTemplate)

              console.log('✅ Correos enviados desde verify-session')
            } catch (emailError) {
              console.error('❌ Error al enviar correos:', emailError)
            }
          }
        }
      }

      // Actualizar restaurante
      await supabase
        .from('restaurantes')
        .update({
          activo: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', restauranteId)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      session: {
        id: session.id,
        customer: session.customer,
        subscription: session.subscription,
        status: session.payment_status,
      },
    })
  } catch (error: any) {
    console.error('Error verifying Stripe session:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error verifying payment' },
      { status: 500 }
    )
  }
}
