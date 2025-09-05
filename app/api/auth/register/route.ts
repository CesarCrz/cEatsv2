import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request){
    const { email, password } = await request.json()
    
    // Validación personalizada ANTES de enviar a Supabase
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
        return NextResponse.json({ error: 'La contraseña debe contener al menos una mayúscula y una minúscula' }, { status: 400 })
    }
    
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status })
    }
    
    return NextResponse.json({user: data.user}, {status: 200})
}