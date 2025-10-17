'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, MapPin, Phone, Building, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'
import { useNotifications } from '@/hooks/use-notifications'

interface InvitationModalProps {
  isOpen: boolean
  onClose: () => void
  restauranteId: string
  onSuccess?: () => void
}

interface FormData {
  nombre_sucursal: string
  email_contacto_sucursal: string
  direccion: string
  ciudad: string
  estado: string
  codigo_postal: string
  telefono_contacto: string
}

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
]

export function InvitationModal({ isOpen, onClose, restauranteId, onSuccess }: InvitationModalProps) {
  const { profile } = useAuth()
  const { canCreateSucursal, getRemainingQuota } = useSubscription()
  const { showSuccess, showError, showValidationErrors, handleApiResponse } = useNotifications()
  const [isLoading, setIsLoading] = useState(false)

  const canCreate = canCreateSucursal()
  const remaining = getRemainingQuota('sucursales')
  
  const [formData, setFormData] = useState<FormData>({
    nombre_sucursal: '',
    email_contacto_sucursal: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    telefono_contacto: ''
  })

  const supabase = createClient()

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    const validationErrors = []

    if (!formData.nombre_sucursal.trim()) {
      validationErrors.push({ field: "Nombre de sucursal", message: "Este campo es requerido" })
    }

    if (!formData.email_contacto_sucursal.trim()) {
      validationErrors.push({ field: "Email de contacto", message: "Este campo es requerido" })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_contacto_sucursal)) {
      validationErrors.push({ field: "Email de contacto", message: "Formato de email inválido" })
    }

    if (!formData.direccion.trim()) {
      validationErrors.push({ field: "Dirección", message: "Este campo es requerido" })
    }

    if (!formData.ciudad.trim()) {
      validationErrors.push({ field: "Ciudad", message: "Este campo es requerido" })
    }

    if (!formData.estado) {
      validationErrors.push({ field: "Estado", message: "Este campo es requerido" })
    }

    if (validationErrors.length > 0) {
      showValidationErrors(validationErrors)
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const payload = {
        restaurante_id: restauranteId,
        ...formData
      }

      const response = await fetch('/api/sucursales/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        showError(result.error || 'Error al enviar la invitación')
        return
      }

      showSuccess({ description: '¡Invitación enviada exitosamente! La sucursal recibirá un email con las instrucciones.' })
      
      // Limpiar formulario
      setFormData({
        nombre_sucursal: '',
        email_contacto_sucursal: '',
        direccion: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        telefono_contacto: ''
      })

      // Cerrar modal después de un momento
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Error al enviar invitación:', error)
      showError({ description: 'Error de conexión. Intenta nuevamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        nombre_sucursal: '',
        email_contacto_sucursal: '',
        direccion: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        telefono_contacto: ''
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>Invitar Nueva Sucursal</span>
          </DialogTitle>
          <DialogDescription>
            Envía una invitación por email para que una nueva sucursal se registre en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>Información Básica</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_sucursal">Nombre de la Sucursal *</Label>
                <Input
                  id="nombre_sucursal"
                  value={formData.nombre_sucursal}
                  onChange={(e) => handleInputChange('nombre_sucursal', e.target.value)}
                  placeholder="Ej: Sucursal Centro"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_contacto_sucursal">Email de Contacto *</Label>
                <Input
                  id="email_contacto_sucursal"
                  type="email"
                  value={formData.email_contacto_sucursal}
                  onChange={(e) => handleInputChange('email_contacto_sucursal', e.target.value)}
                  placeholder="contacto@sucursal.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono_contacto">Teléfono de Contacto</Label>
              <Input
                id="telefono_contacto"
                value={formData.telefono_contacto}
                onChange={(e) => handleInputChange('telefono_contacto', e.target.value)}
                placeholder="+52 55 1234 5678"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Dirección</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección Completa *</Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                placeholder="Calle, número, colonia..."
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad *</Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  placeholder="Ciudad"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleInputChange('estado', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_MEXICO.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo_postal">Código Postal</Label>
                <Input
                  id="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={(e) => handleInputChange('codigo_postal', e.target.value)}
                  placeholder="12345"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de límites */}
        <div className="space-y-3 mt-4">
          {!canCreate && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Has alcanzado el límite máximo de sucursales para tu plan actual. Actualiza tu plan para poder enviar más invitaciones.
              </AlertDescription>
            </Alert>
          )}
          
          {canCreate && remaining !== 'unlimited' && remaining <= 2 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Te quedan {remaining} sucursales disponibles en tu plan actual.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !canCreate}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Invitación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}