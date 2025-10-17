'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Clock, Loader2, Eye, EyeOff } from 'lucide-react'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (token) {
      verifyInvitation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const verifyInvitation = async () => {
    try {
      setPageState('loading')
      
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
    setErrors([])
    
    try {
      // Llamar al endpoint de creación
      const response = await fetch('/api/sucursales/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrors([result.error || 'Error al crear la cuenta'])
        return
      }

      // Iniciar sesión automáticamente
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email_sucursal,
        password: password
      })

      if (signInError) {
        // Si falla el login, redirigir al login con mensaje
        router.push('/login?message=Cuenta creada exitosamente. Inicia sesión.')
      } else {
        // Login exitoso, redirigir al dashboard de la sucursal
        router.push(`/dashboard/sucursales/${result.data.sucursal_id}`)
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
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-medium">Detalles de la Sucursal:</h3>
                <p><strong>Nombre:</strong> {invitation?.nombre_sucursal}</p>
                <p><strong>Dirección:</strong> {invitation?.direccion}</p>
                <p><strong>Ciudad:</strong> {invitation?.ciudad}, {invitation?.estado}</p>
                <p><strong>Email:</strong> {invitation?.email_sucursal}</p>
              </div>

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

              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      disabled={isCreating}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isCreating}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      disabled={isCreating}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isCreating}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

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