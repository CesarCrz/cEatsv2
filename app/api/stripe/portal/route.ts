import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    // ✅ CRÍTICO: Agregar autenticación del usuario
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { restauranteId } = await request.json()

    if (!restauranteId) {
      return NextResponse.json({ error: 'Restaurant ID es requerido' }, { status: 400 })
    }

    // ✅ Verificar que el usuario tiene acceso a ese restaurante
    const supabaseAdmin = createServiceRoleClient()
    
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('restaurante_id')
      .eq('id', user.id)
      .single()

    if (userProfile?.restaurante_id !== restauranteId) {
      return NextResponse.json({ error: 'No tienes acceso a este restaurante' }, { status: 403 })
    }

    // ✅ Resto del código está bien...
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('suscripciones')
      .select('stripe_customer_id')
      .eq('restaurante_id', restauranteId)
      .eq('status', 'active')
      .single()

    if (subscriptionError || !subscription?.stripe_customer_id) {
      return NextResponse.json({ 
        error: 'No se encontró una suscripción activa o customer ID de Stripe' 
      }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/restaurantes/${restauranteId}/planes`,
    })

    return NextResponse.json({ url: portalSession.url })

  } catch (error) {
    console.error('Error al crear sesión del portal:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}