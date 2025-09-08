import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { email, code } = await request.json()
    const supabase = await createClient()

    //buscar el usuario por email y código
    const { data: profile, error} = await supabase 
    .from('user_profiles')
    .select('id, verification_code, verification_code_expires_at')
    .eq('email', email)
    .single()

    if ( error ||  !profile ){
        return NextResponse.json({ error: 'Código Inválido' }, { status: 400 })
    }

    if (profile.verification_code !== code) {
        return NextResponse.json({ error: 'Código incorrecto'}, { status: 400 })
    }

    if (new Date() > new Date(profile.verification_code_expires_at)) {
        return NextResponse.json({ error: 'Código expirado'}, { status: 400 })
    }

    // limpiar código usado
    await supabase
    .from('user_profiles')
    .update({
        verification_code: null,
        verification_code_expires_at: null
    })
    .eq('id', profile.id)

    return NextResponse.json({ success: true, userId: profile.id})
}

