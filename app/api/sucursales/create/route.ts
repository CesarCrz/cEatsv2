import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateTemporaryPassword, sendCustomEmail, getNewBrachTemplate } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const { 
            restaurante_id,
            nombre_sucursal,
            direccion,
            telefono_contacto,
            email_contacto_sucursal,
            ciudad,
            estado,
            codigo_postal,
            latitud,
            longitud
        } = await request.json()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('restaurante_id')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
        }

        const { data: subscriptionData } = await supabase
            .from('suscripciones')
            .select('plan_type')
            .eq('restaurante_id', profile?.restaurante_id)
            .eq('status', 'active')
            .single()

        if (!subscriptionData) {
            return NextResponse.json({ 
                error: 'No hay suscripción activa. Por favor, subscribe a un plan para continuar.',
                code: 'NO_SUBSCRIPTION'
            }, { status: 403 })
        }

        const currentPlan = subscriptionData.plan_type
        
        // obtenemos los limites del plan
        const { data: configData } = await supabase
            .from('configuraciones_sistema')
            .select('valor')
            .eq('clave', 'planes_limites')
            .single()
        
        if (!configData) {
            return NextResponse.json({ error: 'Configuración de planes no encontrada' }, { status: 500 })
        }
        
        const planesLimites = configData.valor as any
        const planLimits = planesLimites[currentPlan]

        if (!planLimits) {
            return NextResponse.json({ 
                error: 'Plan no encontrado en la configuración',
                code: 'INVALID_PLAN'
            }, { status: 500 })
        }

        //contar cantidad de sucursales actuales
        const { count: sucursalesCounts} = await supabase
            .from('sucursales')
            .select('*', {count: 'exact',  head: true})
            .eq('restaurante_id', profile.restaurante_id)

        // debemos validar el limite de sucursales
        if (planLimits.max_sucursales !== 'unlimited' && sucursalesCounts !== null && sucursalesCounts >= planLimits.max_sucursales) {
            return NextResponse.json({ 
                error: `Has alcanzado el límite de ${planLimits.max_sucursales} sucursales para tu plan ${planLimits.nombre_display}. Por favor, actualiza tu plan para agregar más sucursales.`,
                code: 'LIMIT_EXCEEDED',
                upgradeRequired: true,
                currentCount: sucursalesCounts,
                maxAllowed: planLimits.max_sucursales
            }, { status: 403 })
        }
        

        // Generar código temporal para la sucursal
        const tempPassword = generateTemporaryPassword()
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const expirationDate = new Date()
        expirationDate.setHours(expirationDate.getHours() + 24) // 24 horas para sucursales

        // Crear la sucursal
        const { data: sucursal, error: sucursalError } = await supabase
            .from('sucursales')
            .insert({
                restaurante_id: restaurante_id,
                nombre_sucursal: nombre_sucursal,
                direccion: direccion,
                telefono_contacto: telefono_contacto || null,
                email_contacto_sucursal: email_contacto_sucursal,
                ciudad: ciudad,
                estado: estado,
                codigo_postal: codigo_postal || null,
                latitud: latitud || null,
                longitud: longitud || null,
                verification_code: verificationCode,
                verification_code_expires_at: expirationDate.toISOString(),
                is_verified: false,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (sucursalError) {
            return NextResponse.json({ 
                error: 'Error al crear la sucursal' 
            }, { status: 500 })
        }

        // Crear usuario para la sucursal con contraseña temporal
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email_contacto_sucursal,
            password: tempPassword,
            email_confirm: true // Auto-confirmar el email para sucursales
        })

        if (authError) {
            return NextResponse.json({ 
                error: 'Error al crear usuario de sucursal' 
            }, { status: 500 })
        }

        // Crear perfil para el usuario de sucursal
        await supabase
            .from('user_profiles')
            .insert({
                id: authData.user.id,
                email: email_contacto_sucursal,
                nombre: `Sucursal ${nombre_sucursal}`,
                restaurante_id: restaurante_id,
                sucursal_id: sucursal.id,
                role: 'sucursal',
                is_active: true,
                is_first_login: true,
                temp_password: tempPassword,
                email_verified: true, // Auto-verificado para sucursales
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        // Obtener datos del restaurante para el email
        const { data: restaurante } = await supabase
            .from('restaurantes')
            .select('nombre')
            .eq('id', restaurante_id)
            .single()

        // Actualizar contador de uso de sucursales
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
        await supabase
            .from('uso_restaurantes')
            .upsert({
                restaurante_id: restaurante_id,
                mes: currentMonth,
                sucursales_creadas: (sucursalesCounts || 0) + 1
            }, {
                onConflict: 'restaurante_id,mes'
            })

        // Enviar email de bienvenida a la sucursal
        const template = getNewBrachTemplate(
            nombre_sucursal,
            tempPassword,
            restaurante?.nombre || 'Restaurante',
            email_contacto_sucursal
        )
        
        await sendCustomEmail(email_contacto_sucursal, template)

        return NextResponse.json({ 
            success: true, 
            sucursal: {
                id: sucursal.id,
                nombre_sucursal: sucursal.nombre_sucursal,
                direccion: sucursal.direccion,
                telefono: sucursal.telefono,
                email_contacto: sucursal.email_contacto_sucursal,
                ciudad: sucursal.ciudad,
                is_active: sucursal.is_active
            },
            message: 'Sucursal creada exitosamente'
        })
    } catch (error) {
        console.error('Error al crear sucursal:', error)
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
    }
}