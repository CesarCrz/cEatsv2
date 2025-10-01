'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useAuth() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const router = useRouter()

    // Función para cargar datos del usuario y perfil
    const loadUserData = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
                setProfile(data.profile)
            } else if (response.status === 401) {
                // Usuario no autenticado
                setUser(null)
                setProfile(null)
            } else {
                console.error('Error cargando datos de usuario:', response.status)
            }
        } catch (error) {
            console.error('Error en loadUserData:', error)
        }
    }

    // Cargar el usuario al inicio
    useEffect(() => {
        const supabase = createClient()
        
        // Obtener el usuario actual y su perfil
        const fetchUser = async () => {
            await loadUserData()
        }
        
        fetchUser()
        
        // Suscribirse a cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await loadUserData()
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
            }
        })
        
        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)
        
        try {
            const supabase = createClient()
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            console.log('Response from server:', data, error)
            
            if (error) throw error
            
            // Los datos se cargarán automáticamente por el onAuthStateChange
            return data
        } catch (err: any) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const register = async (userData: {
        email: string,
        password: string,
        nombre: string,
        apellidos: string,
        telefono: string,
        country_code?: string,
        fecha_nacimiento: string,
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
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error en el registro')
            }

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
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback`
                }
            })
            
            if (error) throw error
            
            return data
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
            
            setUser(null)
            setProfile(null)
            router.push('/login')
        } catch (err) {
            console.error(`Error al cerrar sesion ${err}`)
        } finally {
            setLoading(false)
        }
    }

    return {
        user,
        profile,
        login, 
        register,
        loginWithGoogle,
        logout,
        loading,
        error,
        refetch: loadUserData // ✅ Función para recargar datos manualmente
    }
}