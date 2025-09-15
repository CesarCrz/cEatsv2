'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, MapPin, Phone, Building } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

interface InvitationModalProps {
  isOpen: boolean
  onClose: () => void
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
  latitud: string
  longitud: string
}

const ESTADOS_MEXICO = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
]

export function InvitationModal({ isOpen, onClose, onSuccess }: InvitationModalProps) {
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    nombre_sucursal: '',
    email_contacto_sucursal: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigo_postal: '',
    telefono_contacto: '',
    latitud: '',
    longitud: ''
  })

  const supabase = createClient()

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const validateForm = () => {
    const newErrors = []

    if (!formData.nombre_sucursal.trim()) {
      newErrors.push('El nombre de la sucursal es requerido')
    }

    if (!formData.email_contacto_sucursal.trim()) {
      newErrors.push('El email de contacto es requerido')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_contacto_sucursal)) {
      newErrors.push('El email no tiene un formato válido')
    }

    if (!formData.direccion.trim()) {
      newErrors.push('La dirección es requerida')
    }

    if (!formData.ciudad.trim()) {
      newErrors.push('La ciudad es requerida')
    }

    if (!formData.estado) {
      newErrors.push('El estado es requerido')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setErrors([])
    setSuccessMessage('')

    try {
      const payload = {
        restaurante_id: profile?.restaurante_id,
        ...formData,
        // Convertir coordenadas a números si existen
        latitud: formData.latitud ? parseFloat(formData.latitud) : null,
        longitud: formData.longitud ? parseFloat(formData.longitud) : null
      }

      const response = await fetch('/api/invitar-sucursal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrors([result.error || 'Error al enviar la invitación'])
        return
      }

      setSuccessMessage('¡Invitación enviada exitosamente! La sucursal recibirá un email con las instrucciones.')
      
      // Limpiar formulario
      setFormData({
        nombre_sucursal: '',
        email_contacto_sucursal: '',
        direccion: '',
        ciudad: '',
        estado: '',
        codigo_postal: '',
        telefono_contacto: '',
        latitud: '',
        longitud: ''
      })

      // Cerrar modal después de un momento
      setTimeout(() => {
        onSuccess?.()
        onClose()
        setSuccessMessage('')
      }, 2000)

    } catch (error) {
      console.error('Error al enviar invitación:', error)
      setErrors(['Error de conexión. Intenta nuevamente.'])
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
        telefono_contacto: '',
        latitud: '',
        longitud: ''
      })
      setErrors([])
      setSuccessMessage('')
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
          {/* Mensajes de error y éxito */}
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

          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

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

          {/* Coordenadas (opcionales) */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground">
              Coordenadas (Opcional)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitud">Latitud</Label>
                <Input
                  id="latitud"
                  type="number"
                  step="any"
                  value={formData.latitud}
                  onChange={(e) => handleInputChange('latitud', e.target.value)}
                  placeholder="19.4326"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitud">Longitud</Label>
                <Input
                  id="longitud"
                  type="number"
                  step="any"
                  value={formData.longitud}
                  onChange={(e) => handleInputChange('longitud', e.target.value)}
                  placeholder="-99.1332"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
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
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
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