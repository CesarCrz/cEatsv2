'use client'

import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useAuth() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

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

            router.push('/dashboard')
            return data
        } catch (err: any) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const register  = async (email: string, password: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/auth/register',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok){
                throw new Error (data.error || 'Error al registrarse')
            }

            router.push('/dashboard')
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
                    redirectTo: `${window.location.origin}/dashboard`
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
        login, 
        register,
        loginWithGoogle,
        logout,
        loading,
        error,
    }
    
}
