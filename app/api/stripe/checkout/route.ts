import  { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest){
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
             return NextResponse.json({ error: 'No autorizado' }, {status: 401 } )
        }

        const { planType } = await request.json()

        //accedemos a la configuracion de planes

        const { data: config } = await supabase
            .from('configuraciones_sistema')
            .select('valor')
            .eq('clave', 'stripe_productos')
            .single()

        const stripeProducts = config?.valor as any

        if (!stripeProducts[planType]){
            return NextResponse.json( { error: 'Plan no válido' }, { status: 400 } ) 
        }

        // obtenemos el perfil dle usuario
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('restaurante_id')
            .eq('id', user.id)
            .single()

            //creamos una sesión de checkout
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: stripeProducts[planType],
                        quantity: 1

                    },
                ],
                success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/plans`,
                customer_email: user.email,
                metadata: {
                    restaurante_id: profile?.restaurante_id,
                    plan_type: planType,
                    user_id: user.id
                }
            })

            return NextResponse.json({ url: session.url })

    } catch (error) {
        console.error(`error creando el checkout: ${error}`)
        return NextResponse.json({ error: 'Error interno en el servidor' }, { status: 500 })     
    }
}