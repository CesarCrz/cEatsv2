import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { 
            email, 
            password, 
            nombre, 
            apellidos, 
            telefono, 
            country_code,
            fecha_nacimiento,
            // Datos del restaurante
            restaurante_nombre,
            nombre_contacto_legal,
            email_contacto_legal,
            telefono_contacto_legal,
            direccion_fiscal,
            rfc,
            terminos_aceptados = false
        } = await request.json()

        const supabase = await createClient()

        // Validar que se aceptaron términos
        if (!terminos_aceptados) {
            return NextResponse.json({ 
                error: 'Debes aceptar los términos y condiciones' 
            }, { status: 400 })
        }

        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 400 })
        }

        // Crear el restaurante
        let restaurante_id = null
        if (restaurante_nombre) {
            const { data: restaurante, error: restauranteError } = await supabase
                .from('restaurantes')
                .insert({
                    nombre: restaurante_nombre,
                    nombre_contacto_legal: nombre_contacto_legal,
                    email_contacto_legal: email_contacto_legal,
                    telefono_contacto_legal: telefono_contacto_legal || null,
                    direccion_fiscal: direccion_fiscal,
                    rfc: rfc || null,
                    terminos_aceptados_at: new Date().toISOString(),
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('id')
                .single()

            if (restauranteError) {
                console.error('Error al crear restaurante:', restauranteError)
                return NextResponse.json({ 
                    error: 'Error al crear el restaurante' 
                }, { status: 500 })
            }

            restaurante_id = restaurante.id
        }

        // Crear perfil de usuario
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: authData.user.id,
                email: email,
                nombre: nombre,
                apellidos: apellidos,
                telefono: telefono,
                country_code: country_code,
                fecha_nacimiento: fecha_nacimiento || null,
                restaurante_id: restaurante_id,
                role: 'admin', // Admin del restaurante
                is_active: true,
                is_first_login: true,
                email_verified: false, // Se verificará con el email de Supabase
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Error al crear perfil:', profileError)
            return NextResponse.json({ 
                error: 'Error al crear el perfil de usuario' 
            }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.',
            user_id: authData.user.id,
            restaurante_id: restaurante_id
        })
    } catch (error) {
        console.error('Error en registro:', error)
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
    }
}