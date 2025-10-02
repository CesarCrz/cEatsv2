// app/api/auth/login/route.ts (VERSIÓN CORRECTA)
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateVerificationCode, sendCustomEmail, getLoginVerificationTemplate } from '@/lib/email'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()
        console.log(`credenciales recibidas: ${email}, ${password ? '****' : 'no password'}`)
        const supabaseAdmin = createServiceRoleClient()
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
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .select('id, nombre, apellidos, role, is_active, verification_code, restaurante_id, is_first_login')
            .eq('id', authData.user.id)
            .single()

        console.log(`ID A BUSCAR: ${authData.user.id}`)
        console.log(`ERROR: ${JSON.stringify(profileError)}`)
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

        if (profile.role === 'admin' && profile.restaurante_id) {
            // vamos a verificar si tiene alguna suscripción activa 
            const { data: subscription, error: subError } = await supabaseAdmin
                .from('suscripciones')
                .select('id, status, created_at, plan_type')
                .eq('restaurante_id', profile.restaurante_id)
                .eq('status', 'active')
                .single()
            
            if (subError && subError.code !== 'PGRST116') { // PGRST116 = no encontrado
                console.error('Error al verificar suscripción:', subError)
                return NextResponse.json({ error: 'Error al verificar suscripción' }, { status: 500 })
            }

            const hasActiveSubscription = !!subscription
            let needsSubscription = !hasActiveSubscription

            if (subscription?.plan_type === 'trial') {
                const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000)
                if (new Date(subscription.created_at) < thirtyDaysAgo) {
                    needsSubscription = true
                }
            }

            if (needsSubscription) {
                //vamos a marcar como first_login false
                const { error: updateError } = await supabaseAdmin 
                    .from('user_profiles')
                    .update({ is_first_login: false})
                    .eq('id', profile.id)

                if (updateError) {
                    console.error(`Error updating is_first_login for user ${profile.id}:`, updateError)
                    // Continuar normalmente, no es crítico
                }
                    
                return NextResponse.json({
                    success: true,
                    redirect: `/dashboard/restaurantes/${profile.restaurante_id}/planes`,
                    message: 'Selecciona un plan para continuar'
                })
            }
        }
 
        // Para usuarios de email/password, generar y enviar código de 2FA
        const verificationCode = generateVerificationCode()
        const expirationTimestamp = Date.now() + (10 * 60 * 1000) // 10 minutos en timestamp

        // Actualizar código en la base de datos
        await supabaseAdmin
            .from('user_profiles')
            .update({
                verification_code: parseInt(verificationCode),
                verification_code_expires_at: expirationTimestamp,
                is_first_login: false,
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