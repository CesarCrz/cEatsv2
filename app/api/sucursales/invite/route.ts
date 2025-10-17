import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'
import { sendCustomEmail } from '@/lib/email/sender'
import { getInvitationTemplate } from '@/lib/email/templates'

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
            codigo_postal
        } = await request.json()

        // Validaciones básicas
        if (!restaurante_id || !nombre_sucursal || !email_contacto_sucursal || !direccion || !ciudad || !estado) {
            return NextResponse.json(
                { error: 'Campos requeridos faltantes' },
                { status: 400 }
            )
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email_contacto_sucursal)) {
            return NextResponse.json(
                { error: 'Formato de email inválido' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Verificar que el usuario actual es admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, restaurante_id')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin' || profile?.restaurante_id !== restaurante_id) {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
        }

        // Usar Service Role Client para bypass RLS
        const supabaseAdmin = createServiceRoleClient()

        // 1️⃣ VALIDAR LÍMITES DEL PLAN
        // Obtener configuración de planes
        const { data: configData, error: configError } = await supabaseAdmin
            .from('configuraciones_sistema')
            .select('valor')
            .eq('clave', 'planes_limites')
            .single()

        if (configError) {
            console.error('Error obteniendo configuración de planes:', configError)
            return NextResponse.json(
                { error: 'Error al validar límites del plan' },
                { status: 500 }
            )
        }

        const planesLimites = configData.valor

        // Obtener suscripción activa del restaurante
        const { data: suscripcion, error: suscripcionError } = await supabaseAdmin
            .from('suscripciones')
            .select('plan_type, status')
            .eq('restaurante_id', restaurante_id)
            .eq('status', 'active')
            .single()

        if (suscripcionError || !suscripcion) {
            return NextResponse.json(
                { error: 'No se encontró una suscripción activa' },
                { status: 403 }
            )
        }

        const planActual = suscripcion.plan_type
        const limitesSucursales = planesLimites[planActual]?.max_sucursales

        // Verificar si el plan tiene límite de sucursales
        if (limitesSucursales !== 'unlimited') {
            // Contar sucursales activas actuales
            const { count: sucursalesActivas, error: countError } = await supabaseAdmin
                .from('sucursales')
                .select('id', { count: 'exact', head: true })
                .eq('restaurante_id', restaurante_id)
                .eq('is_active', true)

            if (countError) {
                console.error('Error contando sucursales:', countError)
                return NextResponse.json(
                    { error: 'Error al verificar límites' },
                    { status: 500 }
                )
            }

            // Validar límite
            if ((sucursalesActivas || 0) >= limitesSucursales) {
                return NextResponse.json(
                    { 
                        error: `Has alcanzado el límite de ${limitesSucursales} sucursal(es) de tu plan ${planActual}`,
                        limite: limitesSucursales,
                        actuales: sucursalesActivas,
                        plan: planActual
                    },
                    { status: 403 }
                )
            }
        }

        // 2️⃣ VERIFICAR INVITACIONES Y USUARIOS EXISTENTES
        // Verificar si ya existe una invitación pendiente para este email
        const { data: existingInvitation } = await supabaseAdmin
            .from('invitaciones_sucursales')
            .select('id, usado, fecha_expiracion')
            .eq('email_sucursal', email_contacto_sucursal)
            .eq('restaurante_id', restaurante_id)
            .eq('usado', false)
            .gt('fecha_expiracion', new Date().toISOString())
            .single()

        if (existingInvitation) {
            return NextResponse.json({ 
                error: 'Ya existe una invitación pendiente para este email' 
            }, { status: 400 })
        }

        // Verificar si ya existe una sucursal con este email
        const { data: existingSucursal } = await supabaseAdmin
            .from('sucursales')
            .select('id')
            .eq('email_contacto_sucursal', email_contacto_sucursal)
            .eq('restaurante_id', restaurante_id)
            .single()

        if (existingSucursal) {
            return NextResponse.json({ 
                error: 'Ya existe una sucursal registrada con este email' 
            }, { status: 400 })
        }

        // 3️⃣ CREAR INVITACIÓN
        // Generar token único
        const token = crypto.randomUUID()
        const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

        const { data: invitation, error: invitationError } = await supabaseAdmin
            .from('invitaciones_sucursales')
            .insert({
                restaurante_id,
                email_sucursal: email_contacto_sucursal,
                nombre_sucursal,
                direccion,
                telefono: telefono_contacto || null,
                ciudad,
                estado,
                codigo_postal: codigo_postal || null,
                token_invitacion: token,
                usado: false,
                fecha_expiracion: expirationDate.toISOString()
            })
            .select()
            .single()

        if (invitationError) {
            console.error('Error al crear invitación:', invitationError)
            return NextResponse.json({ 
                error: 'Error al crear la invitación' 
            }, { status: 500 })
        }

        // 4️⃣ OBTENER DATOS DEL RESTAURANTE
        const { data: restaurante } = await supabaseAdmin
            .from('restaurantes')
            .select('nombre')
            .eq('id', restaurante_id)
            .single()

        if (!restaurante) {
            console.error('No se encontró el restaurante')
            return NextResponse.json(
                { error: 'No se encontró información del restaurante' },
                { status: 404 }
            )
        }

        // 5️⃣ ENVIAR EMAIL CON FUNCIÓN SENDCUSTOMEMAIL
        const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/aceptar-invitacion/${token}`
        
        const template = getInvitationTemplate(
            nombre_sucursal,
            invitationLink,
            restaurante.nombre
        )

        const emailSent = await sendCustomEmail(email_contacto_sucursal, template)

        if (!emailSent) {
            console.error('❌ Error enviando email de invitación')
            // No fallar la request, la invitación ya está creada
            // El admin puede reenviar el email manualmente si es necesario
            return NextResponse.json({ 
                success: true, 
                warning: 'Invitación creada pero hubo un error al enviar el email',
                message: 'Invitación creada exitosamente, pero el email no pudo ser enviado. Contacta al soporte.',
                invitacion: {
                    id: invitation.id,
                    email: email_contacto_sucursal,
                    nombre_sucursal,
                    token,
                    expira: expirationDate.toISOString()
                }
            })
        }

        console.log('✅ Email de invitación enviado exitosamente a:', email_contacto_sucursal)

        return NextResponse.json({ 
            success: true, 
            message: 'Invitación enviada exitosamente',
            invitacion: {
                id: invitation.id,
                email: email_contacto_sucursal,
                nombre_sucursal,
                token,
                expira: expirationDate.toISOString()
            }
        })

    } catch (error) {
        console.error('Error en /api/sucursales/invite:', error)
        return NextResponse.json({ 
            error: 'Error en el servidor',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 })
    }
}