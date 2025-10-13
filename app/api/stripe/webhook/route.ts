import { createClient }  from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendCustomEmail } from '@/lib/email/sender'
import { getSubscriptionConfirmationTemplate, getWelcomeSubscriptionTemplate } from '@/lib/email/templates'
import { getPlanInfo, mapPriceIdToPlanType } from '@/lib/subscription/get-plan-info'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
})


export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('stripe-signature')!

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )

        const supabase = createServiceRoleClient()

        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase)
                break

                case 'customer.subscription.updated':
                    await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
                    break

                case 'customer.subscription.deleted':
                    await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
                    break
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error(`Error manejando el webhook: ${error}`)
        return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
    }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
    try {
        // Obtener el restaurante_id de los metadatos
        const restauranteId = session.metadata?.restaurante_id

        if (!restauranteId) {
            console.error('❌ No restaurante_id en metadata')
            return
        }

        if (!session.subscription) {
            console.error('❌ No subscription ID in session')
            return
        }

        console.log('✅ Checkout session completed:', {
            customer: session.customer,
            subscription: session.subscription,
            metadata: session.metadata
        })

        // Obtener la suscripción expandida
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price.product'],
        }) as any

        // Obtener el price_id y mapear al tipo de plan
        const priceId = subscription.items.data[0].price.id
        const planType = mapPriceIdToPlanType(priceId)

        console.log('📋 Procesando suscripción:', {
            priceId,
            planType,
            restauranteId
        })

        // Obtener información del restaurante y usuario
        const { data: restaurante, error: restauranteError } = await supabase
            .from('restaurantes')
            .select('nombre, user_id')
            .eq('id', restauranteId)
            .single()

        if (restauranteError) {
            console.error('❌ Error al obtener información del restaurante:', restauranteError)
        }

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

        // Guardar la suscripción en la base de datos
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
            throw insertError
        }

        console.log('✅ Suscripción guardada exitosamente:', {
            restaurante_id: restauranteId,
            subscription_id: subscription.id,
            plan_type: planType,
        })

        // Actualizar el estado del restaurante a activo
        const { error: updateError } = await supabase
            .from('restaurantes')
            .update({
                activo: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', restauranteId)

        if (updateError) {
            console.error('❌ Error al actualizar restaurante:', updateError)
        }

        // Enviar correos de confirmación si tenemos la información del usuario
        if (userEmail) {
            // Obtener información dinámica del plan
            const planInfo = await getPlanInfo(planType)

            if (planInfo) {
                const nextBillingDate = new Date(subscription.current_period_end * 1000).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })

                // Extraer solo las características incluidas
                const features = planInfo.caracteristicas
                    .filter(c => c.incluido)
                    .map(c => c.texto)

                try {
                    // Enviar email de confirmación de suscripción
                    const confirmationTemplate = getSubscriptionConfirmationTemplate(
                        planInfo.nombre_display,
                        planInfo.precio === 0 ? 'Gratis' : `$${planInfo.precio}/mes`,
                        nextBillingDate,
                        features,
                    )

                    await sendCustomEmail(userEmail, confirmationTemplate)

                    console.log('✅ Email de confirmación enviado a:', userEmail)

                    // Enviar email de bienvenida
                    const welcomeTemplate = getWelcomeSubscriptionTemplate(userName, planInfo.nombre_display)
                    await sendCustomEmail(userEmail, welcomeTemplate)

                    console.log('✅ Email de bienvenida enviado a:', userEmail)
                } catch (emailError) {
                    console.error('❌ Error al enviar correos de confirmación:', emailError)
                    // No lanzamos el error para que no falle el webhook completo
                }
            } else {
                console.error('❌ No se pudo obtener información del plan:', planType)
            }
        } else {
            console.warn('⚠️ No se encontró email del usuario para enviar correos de confirmación')
        }
    } catch (error) {
        console.error('❌ Error en handleCheckoutSessionCompleted:', error)
        throw error
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
    try {
        const sub = subscription as any
        const priceId = sub.items.data[0].price.id
        const planType = mapPriceIdToPlanType(priceId)

        const { error } = await supabase
            .from('suscripciones')
            .update({
                status: sub.status,
                plan_type: planType,
                current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
                current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                cancel_at_period_end: sub.cancel_at_period_end,
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', sub.id)

        if (error) {
            console.error('❌ Error actualizando suscripción:', error)
        } else {
            console.log('✅ Suscripción actualizada:', sub.id)
        }
    } catch (error) {
        console.error('❌ Error en handleSubscriptionUpdated:', error)
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
    try {
        const { error } = await supabase
            .from('suscripciones')
            .update({
                status: 'canceled',
                updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

        if (error) {
            console.error('❌ Error cancelando suscripción:', error)
        } else {
            console.log('✅ Suscripción cancelada:', subscription.id)
        }

        // Desactivar el restaurante asociado
        const { data: suscripcion } = await supabase
            .from('suscripciones')
            .select('restaurante_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

        if (suscripcion) {
            await supabase
                .from('restaurantes')
                .update({
                    activo: false,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', suscripcion.restaurante_id)
        }
    } catch (error) {
        console.error('❌ Error en handleSubscriptionDeleted:', error)
    }
}