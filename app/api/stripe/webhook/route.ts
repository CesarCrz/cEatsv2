import { createClient }  from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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

        const supabase = await createClient()

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session

                //crear o actualizar suscripción en la bd
                await supabase
                    .from('suscripciones')
                    .upsert({
                        restaurante_id: session.metadata?.restaurante_id,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                        plan_type: session.metadata?.plan_type,
                        status: 'active',
                        current_period_start: new Date().toISOString(),
                        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    })
                break

                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    const subscription = event.data.object as Stripe.Subscription;
                    
                    // Objeto para almacenar los datos de actualización
                    const updateData: any = {
                        status: subscription.status,
                        cancel_at_period_end: subscription.cancel_at_period_end
                    };

                    // Acceder a los periodos de facturación a través del primer ítem
                    // (asumiendo que solo tienes un ítem en la suscripción)
                    if (subscription.items.data.length > 0) {
                        const subscriptionItem = subscription.items.data[0];
                        
                        if (subscriptionItem.current_period_start) {
                            updateData.current_period_start = new Date(subscriptionItem.current_period_start * 1000).toISOString();
                        }
                        
                        if (subscriptionItem.current_period_end) {
                            updateData.current_period_end = new Date(subscriptionItem.current_period_end * 1000).toISOString();
                        }
                    }

                    
                await supabase
                    .from('suscripciones')
                    .update(updateData)
                    .eq('stripe_subscription_id', subscription.id)
                break
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error(`Error manejando el webhook: ${error}`)
        return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
    }
}