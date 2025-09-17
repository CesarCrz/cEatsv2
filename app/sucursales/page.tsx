"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SucursalFormModal } from "@/components/sucursal-form-modal"
import { InvitationModal } from "@/components/invitation-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { SubscriptionLimitsIndicator } from "@/components/subscription-limits-indicator"
import { Plus, Search, MapPin, Phone, Users, Edit, Trash2, ArrowLeft, Building, Mail } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useSubscription } from "@/hooks/use-subscription"
import { useNotifications } from "@/hooks/use-notifications"
import Link from "next/link"

interface Sucursal {
  id: number
  nombre: string
  direccion: string
  telefono: string
  usuarios: number
  status: string
  gerente: string
}

export default function SucursalesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { 
    canCreateSucursal
  } = useSubscription()
  const { showSuccess, showError, handleApiResponse } = useNotifications()
  const [sucursales, setSucursales] = useState<Sucursal[]>([
    {
      id: 1,
      nombre: "Sucursal Centro",
      direccion: "Av. Juárez 123, Centro, CDMX",
      telefono: "+52 55 1234 5678",
      usuarios: 8,
      status: "activa",
      gerente: "María González",
    },
    {
      id: 2,
      nombre: "Sucursal Norte",
      direccion: "Blvd. Norte 456, Satélite, Edo. Méx.",
      telefono: "+52 55 8765 4321",
      usuarios: 12,
      status: "activa",
      gerente: "Carlos Ruiz",
    },
    {
      id: 3,
      nombre: "Sucursal Sur",
      direccion: "Av. Sur 789, Coyoacán, CDMX",
      telefono: "+52 55 5555 0000",
      usuarios: 6,
      status: "inactiva",
      gerente: "Ana López",
    },
    {
      id: 4,
      nombre: "Sucursal Oeste",
      direccion: "Calle Oeste 321, Santa Fe, CDMX",
      telefono: "+52 55 9999 1111",
      usuarios: 10,
      status: "activa",
      gerente: "Pedro Martín",
    },
  ])

  const [showSucursalModal, setShowSucursalModal] = useState(false)
  const [showInvitationModal, setShowInvitationModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null)
  const [sucursalToDelete, setSucursalToDelete] = useState<Sucursal | null>(null)

  const gerentes = ["María González", "Carlos Ruiz", "Ana López", "Pedro Martín", "Laura Sánchez", "Diego Torres"]

  const handleAddSucursal = () => {
    setSelectedSucursal(null)
    setShowSucursalModal(true)
  }

  const handleInviteSucursal = () => {
    setShowInvitationModal(true)
  }

  const handleEditSucursal = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal)
    setShowSucursalModal(true)
  }

  const handleDeleteSucursal = (sucursal: Sucursal) => {
    setSucursalToDelete(sucursal)
    setShowDeleteModal(true)
  }

  const handleSaveSucursal = async (sucursalData: Omit<Sucursal, "id" | "usuarios">) => {
    if (selectedSucursal) {
      // Edit existing sucursal - por ahora mantener lógica local
      // TODO: Implementar API para editar sucursales
      setSucursales(sucursales.map((s) => (s.id === selectedSucursal.id ? { ...s, ...sucursalData } : s)))
      showSuccess({ description: "Sucursal actualizada exitosamente" })
      setShowSucursalModal(false)
    } else {
      // Add new sucursal usando la API real
      try {
        const response = await fetch('/api/sucursales/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_sucursal: sucursalData.nombre,
            direccion: sucursalData.direccion,
            telefono: sucursalData.telefono,
            email_contacto_sucursal: `sucursal.${sucursalData.nombre.toLowerCase().replace(/\s+/g, '')}@restaurante.com`, // Email temporal
            ciudad: "Ciudad", // Campo temporal
            estado: "Estado", // Campo temporal
            codigo_postal: "12345", // Campo temporal
            telefono_contacto: sucursalData.telefono,
            latitud: "0", // Campo temporal
            longitud: "0", // Campo temporal
          }),
        })

        const result = await handleApiResponse(response, {
          successMessage: "Sucursal creada exitosamente"
        })

        if (result.success) {
          // Actualizar la lista local con la nueva sucursal
          const newSucursal: Sucursal = {
            id: result.data.sucursal.id,
            nombre: result.data.sucursal.nombre_sucursal,
            direccion: result.data.sucursal.direccion,
            telefono: result.data.sucursal.telefono,
            gerente: "Por asignar",
            status: result.data.sucursal.is_active ? "activa" : "inactiva",
            usuarios: 0,
          }
          setSucursales([...sucursales, newSucursal])
          setShowSucursalModal(false)
        }
      } catch (error) {
        showError({ 
          description: "Error al crear la sucursal. Intenta nuevamente." 
        })
      }
    }
  }

  const handleConfirmDelete = async () => {
    if (sucursalToDelete) {
      try {
        // TODO: Implementar API para eliminar sucursales
        // const response = await fetch(`/api/sucursales/${sucursalToDelete.id}`, {
        //   method: 'DELETE',
        // })
        // await handleApiResponse(response, {
        //   successMessage: "Sucursal eliminada exitosamente"
        // })
        
        // Por ahora usar lógica local
        setSucursales(sucursales.filter((s) => s.id !== sucursalToDelete.id))
        showSuccess({ description: "Sucursal eliminada exitosamente" })
        setSucursalToDelete(null)
        setShowDeleteModal(false)
      } catch (error) {
        showError({ 
          description: "Error al eliminar la sucursal. Intenta nuevamente." 
        })
      }
    }
  }

  const filteredSucursales = sucursales.filter(
    (sucursal) =>
      sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.gerente.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    return status === "activa"
      ? "bg-green-500/10 text-green-700 border-green-500/20"
      : "bg-red-500/10 text-red-700 border-red-500/20"
  }

  const isAtLimit = !canCreateSucursal()

  return (
    <ProtectedRoute requiredPermission="canAccessSucursalManagement">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Header */}
        <header className="glass-strong border-b border-border/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Gestión de Sucursales
                  </h1>
                  <p className="text-xs text-muted-foreground">Administra todas tus ubicaciones</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar sucursales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleInviteSucursal}
                variant="outline"
                disabled={isAtLimit}
                className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4 mr-2" />
                Invitar Sucursal
              </Button>
              <Button
                onClick={handleAddSucursal}
                disabled={isAtLimit}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Sucursal
              </Button>
            </div>
          </div>

          {/* Límites de Suscripción */}
          <SubscriptionLimitsIndicator 
            type="sucursales"
            title="Límites de Sucursales"
            description="Administra el uso de sucursales en tu plan actual"
            className="mb-6"
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sucursales</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sucursales.length}</div>
              </CardContent>
            </Card>

            <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activas</CardTitle>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sucursales.filter((s) => s.status === "activa").length}</div>
              </CardContent>
            </Card>

            <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sucursales.reduce((total, s) => total + s.usuarios, 0)}</div>
              </CardContent>
            </Card>

            <Card className="glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(sucursales.reduce((total, s) => total + s.usuarios, 0) / sucursales.length)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sucursales Table */}
          <Card className="glass-strong">
            <CardHeader>
              <CardTitle>Lista de Sucursales</CardTitle>
              <CardDescription>Gestiona y administra todas las sucursales de tu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSucursales.map((sucursal) => (
                  <div
                    key={sucursal.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-6 glass rounded-lg hover:glass-strong transition-all duration-300 space-y-4 lg:space-y-0"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{sucursal.nombre}</h3>
                          <p className="text-sm text-muted-foreground">Gerente: {sucursal.gerente}</p>
                        </div>
                        <Badge className={`${getStatusColor(sucursal.status)} border ml-auto lg:ml-0`}>
                          {sucursal.status === "activa" ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{sucursal.direccion}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{sucursal.telefono}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{sucursal.usuarios} usuarios asignados</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 lg:ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSucursal(sucursal)}
                        className="glass hover:glass-strong bg-transparent cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSucursal(sucursal)}
                        className="glass hover:glass-strong text-destructive hover:text-destructive bg-transparent cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredSucursales.length === 0 && (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron sucursales</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Intenta con otros términos de búsqueda" : "Añade tu primera sucursal para comenzar"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <SucursalFormModal
          isOpen={showSucursalModal}
          onClose={() => setShowSucursalModal(false)}
          onSave={handleSaveSucursal}
          sucursal={selectedSucursal}
          gerentes={gerentes}
        />

        <InvitationModal
          isOpen={showInvitationModal}
          onClose={() => setShowInvitationModal(false)}
          onSuccess={() => {
            // Aquí podrías recargar la lista de sucursales si fuera necesario
            console.log('Invitación enviada exitosamente')
          }}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar Sucursal"
          description="Estás a punto de eliminar la sucursal"
          itemName={sucursalToDelete?.nombre || ""}
        />
      </div>
    </ProtectedRoute>
  )
}
