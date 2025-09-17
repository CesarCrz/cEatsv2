import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendCustomEmail, getInvitationTemplate } from '@/lib/email'
import { randomBytes } from 'crypto'

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

        // Verificar que el usuario actual es admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
        }

        // Verificar si ya existe una invitación pendiente para este email
        const { data: existingInvitation } = await supabase
            .from('invitaciones_sucursales')
            .select('id')
            .eq('email_contacto', email_contacto_sucursal)
            .eq('estado_invitacion', 'pendiente')
            .single()

        if (existingInvitation) {
            return NextResponse.json({ 
                error: 'Ya existe una invitación pendiente para este email' 
            }, { status: 400 })
        }

        // Verificar si ya existe un usuario con este email
        const { data: existingUser } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('email', email_contacto_sucursal)
            .single()

        if (existingUser) {
            return NextResponse.json({ 
                error: 'Ya existe un usuario registrado con este email' 
            }, { status: 400 })
        }

        // Generar token único para la invitación
        const invitationToken = randomBytes(32).toString('hex')
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 7) // 7 días para aceptar

        // Crear la invitación
        const { data: invitation, error: invitationError } = await supabase
            .from('invitaciones_sucursales')
            .insert({
                token: invitationToken,
                restaurante_id: restaurante_id,
                email_contacto: email_contacto_sucursal,
                nombre_sucursal: nombre_sucursal,
                direccion: direccion,
                telefono_contacto: telefono_contacto || null,
                ciudad: ciudad,
                estado: estado,
                codigo_postal: codigo_postal || null,
                latitud: latitud || null,
                longitud: longitud || null,
                estado_invitacion: 'pendiente',
                expira_en: expirationDate.toISOString(),
                creado_por: user.id,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (invitationError) {
            console.error('Error al crear invitación:', invitationError)
            return NextResponse.json({ 
                error: 'Error al crear la invitación' 
            }, { status: 500 })
        }

        // Obtener datos del restaurante para el email
        const { data: restaurante } = await supabase
            .from('restaurantes')
            .select('nombre')
            .eq('id', restaurante_id)
            .single()

        // Generar link de invitación
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const invitationLink = `${baseUrl}/aceptar-invitacion/${invitationToken}`

        // Enviar email de invitación
        const template = getInvitationTemplate(
            nombre_sucursal,
            invitationLink,
            restaurante?.nombre || 'Restaurante'
        )
        
        const emailSent = await sendCustomEmail(email_contacto_sucursal, template)

        if (!emailSent) {
            // Si falla el email, eliminar la invitación creada
            await supabase
                .from('invitaciones_sucursales')
                .delete()
                .eq('id', invitation.id)

            return NextResponse.json({ 
                error: 'Error al enviar el email de invitación' 
            }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Invitación enviada exitosamente',
            invitation_id: invitation.id,
            expires_at: expirationDate.toISOString()
        })

    } catch (error) {
        console.error('Error al enviar invitación:', error)
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
    }
}