import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json()
        const supabase = await createClient()

        // Buscar el usuario por email y código
        const { data: profile, error } = await supabase 
            .from('user_profiles')
            .select('id, verification_code, verification_code_expires_at, email_verified')
            .eq('email', email)
            .single()

        if (error || !profile) {
            return NextResponse.json({ error: 'Código Inválido' }, { status: 400 })
        }

        // Convertir código a número para comparar
        const inputCode = parseInt(code)
        if (profile.verification_code !== inputCode) {
            return NextResponse.json({ error: 'Código incorrecto' }, { status: 400 })
        }

        // Verificar expiración (timestamp como number)
        if (Date.now() > profile.verification_code_expires_at) {
            return NextResponse.json({ error: 'Código expirado' }, { status: 400 })
        }

        // Limpiar código y marcar como verificado
        await supabase
            .from('user_profiles')
            .update({
                email_verified: true,
                verification_code: null,
                verification_code_expires_at: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)

        return NextResponse.json({ 
            success: true, 
            userId: profile.id,
            message: 'Email verificado exitosamente'
        })
    } catch (error) {
        console.error('Error al verificar código:', error)
        return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 })
    }
}

