// app/api/auth/resend-verification/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateVerificationCode, sendCustomEmail, getLoginVerificationTemplate } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()
        const supabase = await createClient()

        // Verificar si el usuario existe
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('id, email, nombre, apellidos')
            .eq('email', email)
            .single()

        if (error || !profile) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        // Generar un código de 6 dígitos
        const code = generateVerificationCode()
        
        // Establecer fecha de expiración (10 minutos en timestamp)
        const expirationTimestamp = Date.now() + (10 * 60 * 1000)

        // Guardar el código en la base de datos
        await supabase
            .from('user_profiles')
            .update({
                verification_code: parseInt(code),
                verification_code_expires_at: expirationTimestamp,
                updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)

        // Generar la plantilla de email
        const nombreCompleto = `${profile.nombre || ''} ${profile.apellidos || ''}`.trim() || 'Usuario'
        const template = getLoginVerificationTemplate(code, nombreCompleto)

        // Enviar el email con el código
        const emailResult = await sendCustomEmail(email, template)

        if (!emailResult.success) {
            return NextResponse.json({ 
                error: 'Error al enviar el correo electrónico' 
            }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error al reenviar código:', error)
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
    }
}