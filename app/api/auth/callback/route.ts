import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request){
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code){
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error){
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Si hay error, redirige a una pagina dedicada con el mensaje de error, si no redirige a login mensaje de error
    return NextResponse.redirect(`${origin}/auth/auth-code-error`) || NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

