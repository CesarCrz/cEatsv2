"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Phone, Calendar, Building, MapPin, User, Router } from "lucide-react"
import { CountrySelector } from "@/components/country-selector"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { RSC_PREFETCH_SUFFIX } from "next/dist/lib/constants"

export default function CompleteProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    telefono: "",
    countryCode: "+52",
    fechaNacimiento: "",
    // Datos del restaurante
    restauranteNombre: "",
    nombreContactoLegal: user?.user_metadata?.full_name || "",
    emailContactoLegal: user?.email || "",
    telefonoContactoLegal: "",
    direccionFiscal: "",
    rfc: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = () => {
    return (
      formData.telefono.trim() !== "" &&
      formData.fechaNacimiento.trim() !== "" &&
      formData.restauranteNombre.trim() !== "" &&
      formData.direccionFiscal.trim() !== ""
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('Response from server:', data)
      if (response.ok) {

        if (data?.restaurante_id && data?.redirect_to_plans) {
          router.push(`/dashboard/restaurantes/${data.restaurante_id}/planes`)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error al completar perfil:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle>Completa tu perfil</CardTitle>
          <CardDescription>
            ¡Hola {user?.user_metadata?.full_name}! Necesitamos algunos datos adicionales
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos personales faltantes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono
                  </Label>
                  <div className="flex gap-2">
                    <CountrySelector
                      value={formData.countryCode}
                      onChange={(value) => handleInputChange("countryCode", value)}
                      className="w-32"
                    />
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="55 1234 5678"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Datos del restaurante */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del restaurante</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restauranteNombre">
                    <Building className="w-4 h-4 inline mr-2" />
                    Nombre del Restaurante
                  </Label>
                  <Input
                    id="restauranteNombre"
                    value={formData.restauranteNombre}
                    onChange={(e) => handleInputChange("restauranteNombre", e.target.value)}
                    placeholder="El nombre de tu restaurante"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefonoContactoLegal">Teléfono de Contacto Legal</Label>
                    <Input
                      id="telefonoContactoLegal"
                      value={formData.telefonoContactoLegal}
                      onChange={(e) => handleInputChange("telefonoContactoLegal", e.target.value)}
                      placeholder="Teléfono comercial"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC (Opcional)</Label>
                    <Input
                      id="rfc"
                      value={formData.rfc}
                      onChange={(e) => handleInputChange("rfc", e.target.value)}
                      placeholder="RFC del restaurante"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccionFiscal">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Dirección Fiscal
                  </Label>
                  <Input
                    id="direccionFiscal"
                    value={formData.direccionFiscal}
                    onChange={(e) => handleInputChange("direccionFiscal", e.target.value)}
                    placeholder="Dirección completa para facturación"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid()}
              className="w-full bg-gradient-to-r from-primary to-secondary"
              size="lg"
            >
              Completar Registro
              <ChefHat className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}