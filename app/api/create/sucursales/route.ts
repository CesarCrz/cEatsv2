// app/api/sucursales/route.ts (para cuando implementemos gestión de sucursales)
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
            sucursal: sucursal,
            temp_password: tempPassword // Solo para debugging, remover en producción
        })
    } catch (error) {
        console.error('Error al crear sucursal:', error)
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
    }
}