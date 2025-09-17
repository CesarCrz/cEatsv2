import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { restauranteId } = await request.json()

    if (!restauranteId) {
      return NextResponse.json({ error: 'Restaurant ID es requerido' }, { status: 400 })
    }

    const supabase = await createClient()

    // Obtener la suscripción activa para conseguir el customer_id de Stripe
    const { data: subscription, error: subscriptionError } = await supabase
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

    // Crear sesión del portal del cliente de Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/planes`,
    })

    return NextResponse.json({ url: portalSession.url })

  } catch (error) {
    console.error('Error al crear sesión del portal:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}