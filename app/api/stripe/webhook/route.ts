import { createClient }  from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendCustomEmail } from '@/lib/email/sender'
import { 
    getSubscriptionConfirmationTemplate, 
    getWelcomeSubscriptionTemplate,
    getRenewalConfirmationTemplate,
    getPaymentFailedTemplate
} from '@/lib/email/templates'
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

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
                break

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase)
                break

            default:
                console.log(`⏭️ Evento no manejado: ${event.type}`)
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error(`Error manejando el webhook: ${error}`)
        return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
    }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
    try {
        // Obtener el restaurante_id y user_id de los metadatos
        const restauranteId = session.metadata?.restaurante_id
        const userId = session.metadata?.user_id

        if (!restauranteId) {
            console.error('❌ No restaurante_id en metadata')
            return
        }

        if (!userId) {
            console.error('❌ No user_id en metadata')
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

        // Intentar obtener las fechas de Stripe, si no están disponibles, usar fechas actuales
        let periodStartTimestamp = subscription.current_period_start
        let periodEndTimestamp = subscription.current_period_end

        // Si no están disponibles directamente, intentar desde items
        if (!periodStartTimestamp && subscription.items?.data?.[0]) {
            const item = subscription.items.data[0]
            periodStartTimestamp = item.current_period_start
            periodEndTimestamp = item.current_period_end
        }

        // Si aún no tenemos fechas, crear nuevas basadas en la fecha actual
        let periodStart: Date
        let periodEnd: Date

        if (periodStartTimestamp && periodEndTimestamp) {
            // Usar fechas de Stripe si están disponibles
            periodStart = new Date(periodStartTimestamp * 1000)
            periodEnd = new Date(periodEndTimestamp * 1000)
            console.log('📅 Usando fechas de Stripe')
        } else {
            // Crear fechas nuevas: inicio ahora, fin en 30 días
            periodStart = new Date()
            periodEnd = new Date()
            periodEnd.setDate(periodEnd.getDate() + 30) // 30 días desde ahora
            console.log('📅 Creando fechas nuevas (fechas de Stripe no disponibles)')
        }

        console.log('📋 Procesando suscripción:', {
            priceId,
            planType,
            restauranteId,
            userId,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
            subscription_status: subscription.status,
            subscription_id: subscription.id
        })

        // Obtener información del usuario directamente con el user_id de metadata
        console.log('🔍 Obteniendo perfil de usuario:', userId)
        
        const { data: userProfile, error: userProfileError } = await supabase
            .from('user_profiles')
            .select('email, nombre, apellidos')
            .eq('id', userId)
            .single()

        if (userProfileError) {
            console.error('❌ Error al obtener perfil de usuario:', userProfileError)
        }

        console.log('📋 Perfil de usuario encontrado:', userProfile)

        const userEmail = userProfile?.email
        const userName = userProfile?.nombre || 'Usuario'
        
        console.log('📧 Información del usuario para emails:', {
            userEmail,
            userName,
            hasEmail: !!userEmail
        })

        console.log('📅 Fechas convertidas:', {
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString()
        })

        // Verificar si la suscripción ya existe para evitar duplicados
        console.log('🔍 Verificando si la suscripción ya existe:', subscription.id)
        
        const { data: existingSubscription } = await supabase
            .from('suscripciones')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .maybeSingle()

        let upsertError

        if (existingSubscription) {
            console.log('♻️ Suscripción existente encontrada, actualizando...')
            
            // Actualizar suscripción existente
            const { error } = await supabase
                .from('suscripciones')
                .update({
                    restaurante_id: restauranteId,
                    stripe_customer_id: subscription.customer as string,
                    plan_type: planType,
                    status: subscription.status,
                    current_period_start: periodStart.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    updated_at: new Date().toISOString(),
                })
                .eq('stripe_subscription_id', subscription.id)

            upsertError = error
        } else {
            console.log('🆕 Suscripción nueva, insertando...')
            
            // Insertar nueva suscripción
            const { error } = await supabase
                .from('suscripciones')
                .insert({
                    restaurante_id: restauranteId,
                    stripe_customer_id: subscription.customer as string,
                    stripe_subscription_id: subscription.id,
                    plan_type: planType,
                    status: subscription.status,
                    current_period_start: periodStart.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })

            upsertError = error
        }

        if (upsertError) {
            console.error('❌ Error al guardar suscripción:', upsertError)
            throw upsertError
        }

        console.log('✅ Suscripción guardada exitosamente:', {
            operacion: existingSubscription ? 'actualizada' : 'creada',
            restaurante_id: restauranteId,
            subscription_id: subscription.id,
            plan_type: planType,
        })

        // Enviar correos de confirmación SOLO para suscripciones nuevas
        if (!existingSubscription && userEmail) {
            console.log('📧 Iniciando proceso de envío de correos a:', userEmail)
            
            // Obtener información dinámica del plan
            const planInfo = await getPlanInfo(planType)

            console.log('📋 Información del plan obtenida:', planInfo ? `${planInfo.nombre_display} - $${planInfo.precio}` : 'null')

            if (planInfo) {
                const nextBillingDate = periodEnd.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })

                // Extraer solo las características incluidas
                const features = planInfo.caracteristicas
                    .filter(c => c.incluido)
                    .map(c => c.texto)

                console.log('📧 Preparando envío de correos con:', {
                    planName: planInfo.nombre_display,
                    price: planInfo.precio === 0 ? 'Gratis' : `$${planInfo.precio}/mes`,
                    nextBillingDate,
                    featuresCount: features.length
                })

                try {
                    // Enviar email de confirmación de suscripción
                    const confirmationTemplate = getSubscriptionConfirmationTemplate(
                        planInfo.nombre_display,
                        planInfo.precio === 0 ? 'Gratis' : `$${planInfo.precio}/mes`,
                        nextBillingDate,
                        features,
                    )

                    console.log('📧 Template de confirmación generado, enviando...')
                    await sendCustomEmail(userEmail, confirmationTemplate)

                    console.log('✅ Email de confirmación enviado a:', userEmail)

                    // Enviar email de bienvenida
                    const welcomeTemplate = getWelcomeSubscriptionTemplate(userName, planInfo.nombre_display)
                    
                    console.log('📧 Template de bienvenida generado, enviando...')
                    await sendCustomEmail(userEmail, welcomeTemplate)

                    console.log('✅ Email de bienvenida enviado a:', userEmail)
                } catch (emailError) {
                    console.error('❌ Error al enviar correos de confirmación:', emailError)
                    console.error('❌ Detalles del error:', emailError instanceof Error ? emailError.message : String(emailError))
                    // No lanzamos el error para que no falle el webhook completo
                }
            } else {
                console.error('❌ No se pudo obtener información del plan:', planType)
            }
        } else if (existingSubscription) {
            console.log('ℹ️ Suscripción actualizada - no se envían correos de bienvenida')
        } else {
            console.warn('⚠️ No se encontró email del usuario, no se enviarán correos de confirmación')
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

        // Convertir timestamps de manera segura
        const periodStart = new Date(sub.current_period_start * 1000)
        const periodEnd = new Date(sub.current_period_end * 1000)

        if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
            console.error('❌ Fechas inválidas en subscription update:', {
                current_period_start: sub.current_period_start,
                current_period_end: sub.current_period_end
            })
            return
        }

        const { error } = await supabase
            .from('suscripciones')
            .update({
                status: sub.status,
                plan_type: planType,
                current_period_start: periodStart.toISOString(),
                current_period_end: periodEnd.toISOString(),
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

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
    try {
        // Solo procesar si es una renovación de suscripción
        const invoiceData = invoice as any
        if (!invoiceData.subscription) {
            console.log('⏭️ Invoice sin suscripción, ignorando')
            return
        }

        console.log('💰 Procesando pago exitoso de invoice:', invoice.id)

        // Obtener la suscripción completa
        const subscription = await stripe.subscriptions.retrieve(invoiceData.subscription as string)
        const subscriptionData = subscription as any

        // Actualizar las fechas en la BD
        const periodStart = new Date(subscriptionData.current_period_start * 1000)
        const periodEnd = new Date(subscriptionData.current_period_end * 1000)

        const priceId = subscription.items.data[0].price.id
        const planType = mapPriceIdToPlanType(priceId)

        const { data: updatedSub, error: updateError } = await supabase
            .from('suscripciones')
            .update({
                current_period_start: periodStart.toISOString(),
                current_period_end: periodEnd.toISOString(),
                status: subscriptionData.status,
                plan_type: planType,
                updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionData.id)
            .select('restaurante_id')
            .maybeSingle()

        if (updateError) {
            console.error('❌ Error actualizando suscripción después del pago:', updateError)
            return
        }

        if (!updatedSub) {
            console.warn('⚠️ No se encontró suscripción para actualizar')
            return
        }

        console.log('✅ Suscripción renovada exitosamente:', {
            subscription_id: subscriptionData.id,
            restaurante_id: updatedSub.restaurante_id,
            new_period_end: periodEnd.toISOString()
        })

        // Obtener información del usuario para enviar email
        const { data: restaurante } = await supabase
            .from('restaurantes')
            .select('id')
            .eq('id', updatedSub.restaurante_id)
            .single()

        if (restaurante) {
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('email, nombre')
                .eq('restaurante_id', restaurante.id)
                .eq('role', 'admin')
                .maybeSingle()

            if (userProfile?.email) {
                // Obtener información del plan
                const planInfo = await getPlanInfo(planType)

                if (planInfo) {
                    const nextRenewalDate = periodEnd.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })

                    try {
                        const renewalTemplate = getRenewalConfirmationTemplate({
                            userName: userProfile.nombre || 'Usuario',
                            planName: planInfo.nombre_display,
                            amount: planInfo.precio.toString(),
                            nextRenewalDate,
                            dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
                        })

                        await sendCustomEmail(userProfile.email, renewalTemplate)

                        console.log('✅ Email de renovación enviado a:', userProfile.email)
                    } catch (emailError) {
                        console.error('❌ Error al enviar email de renovación:', emailError)
                    }
                }
            }
        }

    } catch (error) {
        console.error('❌ Error en handleInvoicePaymentSucceeded:', error)
    }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
    try {
        const invoiceData = invoice as any
        if (!invoiceData.subscription) {
            console.log('⏭️ Invoice sin suscripción, ignorando')
            return
        }

        console.log('⚠️ Pago fallido de invoice:', invoice.id)

        // Obtener la suscripción
        const subscription = await stripe.subscriptions.retrieve(invoiceData.subscription as string)
        const subscriptionData = subscription as any

        const priceId = subscription.items.data[0].price.id
        const planType = mapPriceIdToPlanType(priceId)

        // Actualizar estado en BD
        const { data: updatedSub, error: updateError } = await supabase
            .from('suscripciones')
            .update({
                status: subscriptionData.status, // Puede ser 'past_due' o 'unpaid'
                updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionData.id)
            .select('restaurante_id')
            .maybeSingle()

        if (updateError) {
            console.error('❌ Error actualizando estado después de pago fallido:', updateError)
            return
        }

        if (!updatedSub) {
            console.warn('⚠️ No se encontró suscripción para actualizar')
            return
        }

        console.log('⚠️ Suscripción marcada como pago fallido:', {
            subscription_id: subscriptionData.id,
            restaurante_id: updatedSub.restaurante_id,
            status: subscriptionData.status,
            attempt: invoice.attempt_count
        })

        // Obtener información del usuario para enviar email
        const { data: restaurante } = await supabase
            .from('restaurantes')
            .select('id')
            .eq('id', updatedSub.restaurante_id)
            .single()

        if (restaurante) {
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('email, nombre')
                .eq('restaurante_id', restaurante.id)
                .eq('role', 'admin')
                .maybeSingle()

            if (userProfile?.email) {
                // Obtener información del plan
                const planInfo = await getPlanInfo(planType)

                if (planInfo) {
                    try {
                        const paymentFailedTemplate = getPaymentFailedTemplate({
                            userName: userProfile.nombre || 'Usuario',
                            planName: planInfo.nombre_display,
                            amount: planInfo.precio.toString(),
                            attemptNumber: invoice.attempt_count || 1,
                            updatePaymentUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/planes`,
                        })

                        await sendCustomEmail(userProfile.email, paymentFailedTemplate)

                        console.log('✅ Email de pago fallido enviado a:', userProfile.email)
                    } catch (emailError) {
                        console.error('❌ Error al enviar email de pago fallido:', emailError)
                    }
                }
            }
        }

    } catch (error) {
        console.error('❌ Error en handleInvoicePaymentFailed:', error)
    }
}