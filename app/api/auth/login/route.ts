import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

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
    
    return NextResponse.json({user: data.user}, {status: 200})

}