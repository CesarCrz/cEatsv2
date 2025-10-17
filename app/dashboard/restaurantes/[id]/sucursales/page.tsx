"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useNotifications } from '@/hooks/use-notifications'
import { useSubscription } from '@/hooks/use-subscription'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { InvitationModal } from '@/components/invitation-modal'
import { Plus, Search, MapPin, Phone, Mail, Users, Settings, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Sucursal {
  id: string
  restaurante_id: string
  nombre_sucursal: string
  direccion: string
  telefono_contacto: string | null
  email_contacto_sucursal: string
  ciudad: string
  estado: string
  codigo_postal: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  // Campos calculados que podrías agregar
  total_usuarios?: number
  total_pedidos_mes?: number
}

interface InvitacionPendiente {
  id: string
  restaurante_id: string
  email_sucursal: string
  nombre_sucursal: string
  direccion: string
  telefono: string | null
  ciudad: string
  estado: string
  codigo_postal: string | null
  token_invitacion: string
  usado: boolean
  fecha_expiracion: string
  created_at: string
}

export default function SucursalesPage() {
  const params = useParams()
  const router = useRouter()
  const restauranteId = params.id as string
  const { user } = useAuth()
  const supabase = createClient()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [invitacionesPendientes, setInvitacionesPendientes] = useState<InvitacionPendiente[]>([])
  const [loading, setLoading] = useState(false)
  const [reenviandoId, setReenviandoId] = useState<string | null>(null)
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false)
  
  const { canCreateSucursal } = useSubscription()
  const { showSuccess, showError, handleApiResponse } = useNotifications()

  // Cargar sucursales del restaurante
  const cargarSucursales = async () => {
    try {
      setLoading(true)
      
      // Cargar sucursales activas
      const { data: sucursalesData, error } = await supabase
        .from('sucursales')
        .select(`
          id,
          restaurante_id,
          nombre_sucursal,
          direccion,
          telefono_contacto,
          email_contacto_sucursal,
          ciudad,
          estado,
          codigo_postal,
          is_active,
          is_verified,
          created_at,
          updated_at
        `)
        .eq('restaurante_id', restauranteId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando sucursales:', error)
        showError({ 
          title: "Error al cargar sucursales",
          description: "No se pudieron cargar las sucursales del restaurante." 
        })
      } else {
        setSucursales(sucursalesData || [])
        console.log('Sucursales cargadas:', sucursalesData)
      }

      // Cargar invitaciones pendientes Y expiradas (no usadas)
      const { data: invitacionesData, error: invitacionesError } = await supabase
        .from('invitaciones_sucursales')
        .select('*')
        .eq('restaurante_id', restauranteId)
        .eq('usado', false)
        .order('created_at', { ascending: false })

      if (invitacionesError) {
        console.error('Error cargando invitaciones:', invitacionesError)
      } else {
        setInvitacionesPendientes(invitacionesData || [])
        console.log('Invitaciones pendientes:', invitacionesData)
      }

    } catch (error) {
      console.error('Error inesperado:', error)
      showError({ 
        title: "Error inesperado",
        description: "Ocurrió un error al cargar las sucursales." 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && restauranteId) {
      cargarSucursales()
    }
  }, [user, restauranteId])

  // Filtrar sucursales por término de búsqueda
  const sucursalesFiltradas = sucursales.filter(sucursal =>
    sucursal.nombre_sucursal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sucursal.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sucursal.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCrearSucursal = () => {
    if (canCreateSucursal()) {
      setIsInvitationModalOpen(true)
    } else {
      showError({ 
        title: "Límite alcanzado",
        description: "Has alcanzado el límite de sucursales de tu plan. Actualiza tu suscripción para crear más." 
      })
    }
  }

  const handleInvitationSuccess = () => {
    setIsInvitationModalOpen(false)
    cargarSucursales()
  }

  // Reenviar invitación reutilizando el endpoint /invite
  const handleReenviarInvitacion = async (invitacion: InvitacionPendiente) => {
    try {
      setReenviandoId(invitacion.id)

      const response = await fetch('/api/sucursales/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurante_id: invitacion.restaurante_id,
          nombre_sucursal: invitacion.nombre_sucursal,
          email_contacto_sucursal: invitacion.email_sucursal,
          direccion: invitacion.direccion,
          telefono_contacto: invitacion.telefono,
          ciudad: invitacion.ciudad,
          estado: invitacion.estado,
          codigo_postal: invitacion.codigo_postal
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Si el error es por invitación pendiente aún válida
        if (result.diasRestantes) {
          showError({
            title: result.error || "No se puede reenviar",
            description: result.details || `La invitación aún es válida por ${result.diasRestantes} día(s) más.`
          })
        } else {
          showError({
            title: result.error || "Error al reenviar invitación",
            description: result.details || "No se pudo reenviar la invitación"
          })
        }
        return
      }

      showSuccess({
        title: "Invitación reenviada",
        description: `Se ha enviado una nueva invitación a ${invitacion.email_sucursal}`
      })

      // Recargar invitaciones para ver los cambios
      await cargarSucursales()

    } catch (error) {
      console.error('Error al reenviar invitación:', error)
      showError({
        title: "Error inesperado",
        description: "Ocurrió un error al reenviar la invitación. Por favor, intenta de nuevo."
      })
    } finally {
      setReenviandoId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando sucursales...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/restaurantes/${restauranteId}`}>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Dashboard</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Gestión de Sucursales
              </h1>
              <p className="text-muted-foreground">
                Administra las sucursales de tu restaurante
              </p>
            </div>
          </div>

          <Button onClick={handleCrearSucursal} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Sucursal</span>
          </Button>
        </div>

        {/* Barra de búsqueda */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar sucursales por nombre, ciudad o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invitaciones Pendientes */}
        {invitacionesPendientes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Invitaciones Pendientes</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {invitacionesPendientes.map((invitacion) => {
                const fechaExpiracion = new Date(invitacion.fecha_expiracion)
                const ahora = new Date()
                const estaExpirada = fechaExpiracion < ahora
                const diasRestantes = Math.ceil((fechaExpiracion.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
                const estaReenviando = reenviandoId === invitacion.id
                
                return (
                  <Card key={invitacion.id} className={estaExpirada ? "border-red-200 dark:border-red-800" : "border-yellow-200 dark:border-yellow-800"}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold mb-2">
                            {invitacion.nombre_sucursal}
                          </CardTitle>
                          <Badge 
                            variant="outline" 
                            className={
                              estaExpirada 
                                ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                            }
                          >
                            {estaExpirada ? "Expirada" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{invitacion.email_sucursal}</span>
                      </div>

                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">{invitacion.direccion}</p>
                          <p className="text-muted-foreground">
                            {invitacion.ciudad}, {invitacion.estado}
                            {invitacion.codigo_postal && ` ${invitacion.codigo_postal}`}
                          </p>
                        </div>
                      </div>

                      {invitacion.telefono && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{invitacion.telefono}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className={`text-xs ${estaExpirada ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-muted-foreground'}`}>
                          {estaExpirada 
                            ? "Invitación expirada" 
                            : `Expira en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`
                          }
                        </span>
                        <Button 
                          variant={estaExpirada ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleReenviarInvitacion(invitacion)}
                          disabled={estaReenviando}
                        >
                          {estaReenviando ? "Reenviando..." : "Reenviar"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Lista de Sucursales */}
        {sucursalesFiltradas.length === 0 && invitacionesPendientes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {sucursales.length === 0 ? "No hay sucursales creadas" : "No se encontraron sucursales"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {sucursales.length === 0 
                  ? "Crea tu primera sucursal para comenzar a gestionar pedidos"
                  : "Intenta con otros términos de búsqueda"
                }
              </p>
              {sucursales.length === 0 && (
                <Button onClick={handleCrearSucursal} className="inline-flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Sucursal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : sucursalesFiltradas.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Sucursales Activas</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sucursalesFiltradas.map((sucursal) => (
                <Card key={sucursal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-2">
                          {sucursal.nombre_sucursal}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={sucursal.is_active ? "default" : "secondary"}>
                            {sucursal.is_active ? "Activa" : "Inactiva"}
                          </Badge>
                          <Badge variant={sucursal.is_verified ? "default" : "destructive"}>
                            {sucursal.is_verified ? "Verificada" : "Sin verificar"}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">{sucursal.direccion}</p>
                        <p className="text-muted-foreground">
                          {sucursal.ciudad}, {sucursal.estado}
                          {sucursal.codigo_postal && ` ${sucursal.codigo_postal}`}
                        </p>
                      </div>
                    </div>

                    {sucursal.telefono_contacto && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{sucursal.telefono_contacto}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{sucursal.email_contacto_sucursal}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {sucursal.total_usuarios || 0} usuarios
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/sucursales/${sucursal.id}`)}
                        >
                          Ver Dashboard
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal de Invitación */}
      <InvitationModal
        isOpen={isInvitationModalOpen}
        onClose={() => setIsInvitationModalOpen(false)}
        restauranteId={restauranteId}
        onSuccess={handleInvitationSuccess}
      />
    </div>
  )
}