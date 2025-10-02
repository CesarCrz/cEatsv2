import  { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
})

export async function POST(request: NextRequest){
    try {
        const supabase = await createClient()
        const supabaseAdmin = createServiceRoleClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
             return NextResponse.json({ error: 'No autorizado' }, {status: 401 } )
        }

        const { planType } = await request.json()

        //accedemos a la configuracion de planes

        // ✅ Agregar validación del error
        console.log(`se va a buscar ${planType} en la bd`)
        const { data: config, error: configError } = await supabaseAdmin
            .from('configuraciones_sistema')
            .select('valor')
            .eq('clave', 'stripe_productos')
            .single()

        if (configError || !config) {
            return NextResponse.json({ error: 'Error obteniendo configuración de planes' }, { status: 500 })
        }

        const stripeProducts = config.valor as any
        console.log(` EEEEE config stripe products: ${JSON.stringify(stripeProducts)}`)

        if (!stripeProducts[planType]) {
            return NextResponse.json({ error: 'Plan no válido' }, { status: 400 })
        }

        // ✅ Agregar validación del perfil
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .select('restaurante_id')
            .eq('id', user.id)
            .single()

        if (profileError || !profile?.restaurante_id) {
            return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
        }

        // creamos una sesión de checkout
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: stripeProducts[planType],
                    quantity: 1
                },
            ],
            // ✅ CORREGIR URLs para incluir restaurante_id
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/restaurantes/${profile.restaurante_id}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/restaurantes/${profile.restaurante_id}/planes`,
            customer_email: user.email,
            metadata: {
                restaurante_id: profile.restaurante_id,
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