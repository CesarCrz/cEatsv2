// app/api/auth/login/route.ts (VERSIÓN CORRECTA)
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateVerificationCode, sendCustomEmail, getLoginVerificationTemplate } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()
        const supabase = await createClient()

        // Autenticar usuario
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Error al autenticar' }, { status: 500 })
        }

        // Verificar si el email está confirmado en Supabase
        if (!authData.user.email_confirmed_at) {
            return NextResponse.json({ 
                error: 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.' 
            }, { status: 403 })
        }

        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, nombre, apellidos, role, is_active, verification_code')
            .eq('id', authData.user.id)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
        }

        // Verificar si el usuario está activo
        if (!profile.is_active) {
            return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 })
        }

        // Si es usuario de Google, permitir acceso directo
        const isGoogleAuth = authData.user.app_metadata?.provider === 'google'
        if (isGoogleAuth) {
            return NextResponse.json({ 
                success: true, 
                redirect: '/dashboard',
                message: 'Login exitoso'
            })
        }

        // Para usuarios de email/password, generar y enviar código de 2FA
        const verificationCode = generateVerificationCode()
        const expirationTimestamp = Date.now() + (10 * 60 * 1000) // 10 minutos en timestamp

        // Actualizar código en la base de datos
        await supabase
            .from('user_profiles')
            .update({
                verification_code: parseInt(verificationCode),
                verification_code_expires_at: expirationTimestamp,
                updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id)

        // Enviar código por email
        const nombreCompleto = `${profile.nombre || ''} ${profile.apellidos || ''}`.trim() || 'Usuario'
        const template = getLoginVerificationTemplate(verificationCode, nombreCompleto)
        const emailResult = await sendCustomEmail(email, template)

        if (!emailResult.success) {
            return NextResponse.json({ 
                error: 'Error al enviar código de verificación' 
            }, { status: 500 })
        }

        return NextResponse.json({ 
            success: true, 
            redirect: '/verify-email',
            message: 'Código de verificación enviado a tu correo'
        })
    } catch (error) {
        console.error('Error en login:', error)
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
    }
}