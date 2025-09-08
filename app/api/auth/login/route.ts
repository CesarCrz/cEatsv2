import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { sendCustomEmail, getLoginVerificationTemplate, generateVerificationCode } from '@/lib/email'

export async function POST(request: Request){
    const { email, password}  = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (!data.user) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }
    
    //Generar y enviar código de verficiación 
    const codigo = generateVerificationCode()

    //guardar código en la base de datos (temporal)
    const { error: updateError} = await supabase
    .from('user_profiles')
    .update({
        verification_code: codigo,
        verification_code_expires_at: new Date(Date.now() + 10 * 60 * 1000)
    })
    .eq('id', data.user.id)

    if (updateError){
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    //obtener el nombre de usuario para la plantilla del email
    const { data: profile } = await supabase
    .from('user_profiles')
    .select('nombre')
    .eq('id', data.user.id)
    .single()
    
    if (!profile){
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    //enviar email con codigo de verificacion
    const template = getLoginVerificationTemplate(codigo, profile?.nombre || 'Usuario' )
    await sendCustomEmail(email, template)

    //Cerrar sesión temporal
    await supabase.auth.signOut()

    return NextResponse.json({
        message: 'Código de verificación enviado correctamente',
        requiresVerification: true
    })
}