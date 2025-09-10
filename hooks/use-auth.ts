'use client'

import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

export function useAuth() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    // Cargar el usuario al inicio
    useEffect(() => {
        const supabase = createClient()
        
        // Obtener el usuario actual
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser()
            setUser(data.user)
        }
        
        fetchUser()
        
        // Suscribirse a cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null)
        })
        
        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok){
                throw new Error(data.error || 'error al iniciar sesion ')
            }

            // Redirigir según la respuesta de la API
            if (data.redirect === '/verify-email') {
                router.push('/verify-email')
            } else if (data.redirect === '/dashboard') {
                router.push('/dashboard')
            }

            return data
        } catch (err: any) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const register  = async (userData: {
        //datos del usuario
        email: string,
        password: string,
        nombre: string,
        apellidos: string,
        telefono: string,
        country_code?: string,
        fecha_nacimiento: string,
        //datos del restaurante
        restaurante_nombre?: string,
        nombre_contacto_legal?: string,
        email_contacto_legal?: string,
        telefono_contacto_legal?: string,
        direccion_fiscal?: string,
        rfc?: string,
        terminos_aceptados: boolean,
    }) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/auth/register',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            })

            const data = await response.json()

            if (!response.ok){
                throw new Error (data.error || 'Error al registrarse')
            }

            router.push('/login?message=confirm_email')
            return data
        } catch (err: any) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const loginWithGoogle = async () => {
        setLoading(true)
        setError(null)
        
        try {
            const supabase = createClient()

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options:{
                    redirectTo: `${window.location.origin}/api/auth/callback`
                }
            })

            if (error){
                throw error
            }

        } catch (err: any) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setLoading(true)

        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/login')
        } catch (err) {
            console.error(`Error al cerrar sesion ${err}`)
        } finally {
            setLoading(false)
        }
    }

    return {
        user,
        login, 
        register,
        loginWithGoogle,
        logout,
        loading,
        error,
    }
    
}
