'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'

interface InvitationData {
  id: string
  nombre_sucursal: string
  email_sucursal: string
  direccion: string
  telefono: string | null
  ciudad: string
  estado: string
  codigo_postal: string | null
  restaurante_id: string
  restaurante_nombre: string
  fecha_expiracion: string
}

type PageState = 'loading' | 'valid' | 'expired' | 'used' | 'invalid' | 'creating'

export default function AceptarInvitacionPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [pageState, setPageState] = useState<PageState>('loading')
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    verifyInvitation()
  }, [token])

  const verifyInvitation = async () => {
    try {
      setPageState('loading')
      
      // Llamar al endpoint de validación
      const response = await fetch('/api/sucursales/validate-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()

      if (!result.success) {
        setPageState(result.status as PageState)
        return
      }

      setInvitation(result.invitation)
      setPageState('valid')
      
    } catch (error) {
      console.error('Error al verificar invitación:', error)
      setPageState('invalid')
    }
  }

  const validateForm = () => {
    const newErrors = []

    if (!password) {
      newErrors.push('La contraseña es requerida')
    } else if (password.length < 8) {
      newErrors.push('La contraseña debe tener al menos 8 caracteres')
    }

    if (password !== confirmPassword) {
      newErrors.push('Las contraseñas no coinciden')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleAcceptInvitation = async () => {
    if (!validateForm() || !invitation) return

    setIsCreating(true)
    
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email_sucursal,
        password: password,
        options: {
          emailRedirectTo: undefined // No enviar email de confirmación
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setErrors(['Ya existe una cuenta con este email. Contacta a support@ceats.app'])
        } else {
          setErrors(['Error al crear la cuenta: ' + authError.message])
        }
        return
      }

      if (!authData.user) {
        setErrors(['Error al crear el usuario. Contacta a support@ceats.app'])
        return
      }

      // 2. Crear la sucursal
      const { data: sucursal, error: sucursalError } = await supabase
        .from('sucursales')
        .insert({
          restaurante_id: invitation.restaurante_id,
          nombre_sucursal: invitation.nombre_sucursal,
          direccion: invitation.direccion,
          telefono_contacto: invitation.telefono,
          email_contacto_sucursal: invitation.email_sucursal,
          ciudad: invitation.ciudad,
          estado: invitation.estado,
          codigo_postal: invitation.codigo_postal,
          is_verified: true, // Auto-verificada por invitación
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (sucursalError) {
        console.error('Error al crear sucursal:', sucursalError)
        setErrors(['Error al crear la sucursal. Contacta a support@ceats.app'])
        return
      }

      // 3. Crear perfil del usuario
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: invitation.email_sucursal,
          nombre: `Sucursal ${invitation.nombre_sucursal}`,
          restaurante_id: invitation.restaurante_id,
          sucursal_id: sucursal.id,
          role: 'sucursal',
          is_active: true,
          is_first_login: false, // Ya configuraron su contraseña
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Error al crear perfil:', profileError)
        setErrors(['Error al crear el perfil. Contacta a support@ceats.app'])
        return
      }

      // 4. Marcar invitación como usada
      await supabase
        .from('invitaciones_sucursales')
        .update({ usado: true })
        .eq('id', invitation.id)

      // 5. Iniciar sesión automáticamente
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email_sucursal,
        password: password
      })

      if (signInError) {
        // Aunque haya error al iniciar sesión, la cuenta se creó exitosamente
        router.push('/login?message=Cuenta creada exitosamente. Inicia sesión.')
      } else {
        // Redirigir al dashboard de sucursal
        router.push(`/dashboard/sucursales/${sucursal.id}`)
      }

    } catch (error) {
      console.error('Error al aceptar invitación:', error)
      setErrors(['Error inesperado. Contacta a support@ceats.app'])
    } finally {
      setIsCreating(false)
    }
  }

  const renderContent = () => {
    switch (pageState) {
      case 'loading':
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando invitación...</span>
              </div>
            </CardContent>
          </Card>
        )

      case 'invalid':
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                <h2 className="text-xl font-semibold text-red-600">Invitación Inválida</h2>
                <p className="text-gray-600">
                  Esta invitación no es válida o ha sido eliminada.
                </p>
                <p className="text-sm text-gray-500">
                  Si crees que esto es un error, contacta a <a href="mailto:support@ceats.app" className="text-blue-600 underline">support@ceats.app</a>
                </p>
                <Button onClick={() => router.push('/login')} variant="outline">
                  Ir al Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'expired':
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Clock className="h-16 w-16 text-orange-500 mx-auto" />
                <h2 className="text-xl font-semibold text-orange-600">Invitación Expirada</h2>
                <p className="text-gray-600">
                  Esta invitación ha expirado (máximo 3 días). Solicita una nueva invitación al administrador.
                </p>
                <p className="text-sm text-gray-500">
                  ¿Necesitas ayuda? Contacta a <a href="mailto:support@ceats.app" className="text-blue-600 underline">support@ceats.app</a>
                </p>
                <Button onClick={() => router.push('/login')} variant="outline">
                  Ir al Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'used':
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-xl font-semibold text-green-600">Invitación Ya Utilizada</h2>
                <p className="text-gray-600">
                  Esta invitación ya ha sido aceptada. Si tienes problemas para acceder, contacta a <a href="mailto:support@ceats.app" className="text-blue-600 underline">support@ceats.app</a>
                </p>
                <Button onClick={() => router.push('/login')}>
                  Ir al Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'valid':
        return (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Completar Registro de Sucursal</CardTitle>
              <CardDescription>
                Has sido invitado a unirte a <strong>{invitation?.restaurante_nombre}</strong> como sucursal <strong>{invitation?.nombre_sucursal}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Información de la sucursal */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-medium">Detalles de la Sucursal:</h3>
                <p><strong>Nombre:</strong> {invitation?.nombre_sucursal}</p>
                <p><strong>Dirección:</strong> {invitation?.direccion}</p>
                <p><strong>Ciudad:</strong> {invitation?.ciudad}, {invitation?.estado}</p>
                <p><strong>Email:</strong> {invitation?.email_sucursal}</p>
              </div>

              {/* Errores */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Formulario de contraseña */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    disabled={isCreating}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-3">
                <Button 
                  onClick={handleAcceptInvitation}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Aceptar Invitación'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/login')}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {renderContent()}
      </div>
    </div>
  )
}