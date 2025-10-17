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

export default function SucursalesPage() {
  const params = useParams()
  const router = useRouter()
  const restauranteId = params.id as string
  const { user } = useAuth()
  const supabase = createClient()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(false)
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false)
  
  const { canCreateSucursal } = useSubscription()
  const { showSuccess, showError, handleApiResponse } = useNotifications()

  // Cargar sucursales del restaurante
  const cargarSucursales = async () => {
    try {
      setLoading(true)
      
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
        return
      }

      // ✅ Siempre setear las sucursales (array vacío o con datos)
      setSucursales(sucursalesData || [])
      console.log('Sucursales cargadas:', sucursalesData)

      // ✅ Solo mostrar notificación informativa, NO error
      if (!sucursalesData || sucursalesData.length === 0) {
        console.log('No se encontraron sucursales para este restaurante')
        // Opcional: podrías mostrar un toast informativo, no de error
        // showSuccess({ 
        //   title: "Sin sucursales",
        //   description: "No hay sucursales creadas para este restaurante." 
        // })
      }

    } catch (error) {
      console.error('Error inesperado:', error)
      showError({ 
        title: "Error inesperado",
        description: "Ocurrió un error al cargar las sucursales." 
      })
    } finally {
      // ✅ SIEMPRE terminar loading, haya o no sucursales
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

        {/* Lista de Sucursales */}
        {sucursalesFiltradas.length === 0 ? (
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
        ) : (
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
        )}
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