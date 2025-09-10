// app/signup/page.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ChefHat, ArrowRight, Mail, Lock, User, Phone, Calendar, Building, MapPin, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { CountrySelector } from "@/components/country-selector"
import { useAuth } from "@/hooks/use-auth" // ✅ Importar useAuth

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false) // ✅ Estado de carga
  const { loginWithGoogle } = useAuth() // ✅ Obtener función de useAuth

  const [formData, setFormData] = useState({
    // Datos del administrador
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    countryCode: "+52",
    fechaNacimiento: "",
    // Datos del restaurante
    nombreRestaurante: "",
    direccionFiscal: "",
    aceptaTerminos: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isStep1Valid = () => {
    return (
      formData.nombre.trim() !== "" &&
      formData.apellidos.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.confirmPassword.trim() !== "" &&
      formData.password === formData.confirmPassword &&
      formData.telefono.trim() !== "" &&
      formData.fechaNacimiento.trim() !== ""
    )
  }

  const isStep2Valid = () => {
    return formData.nombreRestaurante.trim() !== "" && formData.direccionFiscal.trim() !== "" && formData.aceptaTerminos
  }

  const handleContinue = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2)
    }
  }

  // ✅ Conectar con API real
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isStep2Valid()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          country_code: formData.countryCode,
          fecha_nacimiento: formData.fechaNacimiento,
          restaurante_nombre: formData.nombreRestaurante,
          nombre_contacto_legal: `${formData.nombre} ${formData.apellidos}`,
          email_contacto_legal: formData.email,
          direccion_fiscal: formData.direccionFiscal,
          terminos_aceptados: formData.aceptaTerminos
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Redirigir a login con mensaje de confirmación
        window.location.href = "/login?message=confirm_email"
      } else {
        throw new Error(data.error || 'Error al registrar')
      }
    } catch (error) {
      console.error('Error en registro:', error)
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Función para Google OAuth
  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error('Error con Google:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-60 h-60 bg-accent/5 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-primary/5 rounded-full blur-2xl animate-bounce-subtle"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <Card className="w-full max-w-2xl glass-strong relative z-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 hover:shadow-2xl transition-all">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center animate-glow cursor-pointer hover:scale-110 transition-transform duration-300">
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient">
              cEats v2
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Únete a la plataforma líder en gestión de restaurantes
            </CardDescription>
          </div>

          {/* ✅ Mostrar progress solo si no está en modo Google */}
          {currentStep > 0 && (
            <div className="flex items-center justify-center space-x-4 mt-6">
              <div
                className={`flex items-center space-x-2 transition-all duration-500 ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 cursor-pointer hover:scale-110 ${
                    currentStep >= 1
                      ? "bg-primary border-primary text-primary-foreground shadow-lg"
                      : "border-muted-foreground"
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
                </div>
                <span className="text-sm font-medium">Tu Información</span>
              </div>
              <div
                className={`w-12 h-0.5 transition-all duration-500 ${currentStep >= 2 ? "bg-gradient-to-r from-primary to-secondary" : "bg-muted"}`}
              ></div>
              <div
                className={`flex items-center space-x-2 transition-all duration-500 ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 cursor-pointer hover:scale-110 ${
                    currentStep >= 2
                      ? "bg-primary border-primary text-primary-foreground shadow-lg"
                      : "border-muted-foreground"
                  }`}
                >
                  2
                </div>
                <span className="text-sm font-medium">Tu Restaurante</span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ✅ Botón de Google al inicio */}
          {currentStep === 1 && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="w-full glass hover:glass-strong transition-all duration-300 transform hover:scale-[1.02]"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O regístrate con email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Tu Información (Administrador)</h3>
                  <p className="text-muted-foreground mt-1">Datos del contacto principal del restaurante</p>
                </div>

                {/* ... resto del Step 1 igual ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidos" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Apellidos
                    </Label>
                    <Input
                      id="apellidos"
                      type="text"
                      placeholder="Tus apellidos"
                      value={formData.apellidos}
                      onChange={(e) => handleInputChange("apellidos", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="w-4 h-4" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@restaurante.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="w-4 h-4" />
                      Confirmar Contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="flex items-center gap-2 cursor-pointer">
                      <Phone className="w-4 h-4" />
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
                        type="tel"
                        placeholder="55 1234 5678"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange("telefono", e.target.value)}
                        className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong flex-1"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Número completo: {formData.countryCode}
                      {formData.telefono}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaNacimiento" className="flex items-center gap-2 cursor-pointer">
                      <Calendar className="w-4 h-4" />
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                      className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={!isStep1Valid() || isLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Información de tu Restaurante</h3>
                  <p className="text-muted-foreground mt-1">Datos comerciales y fiscales</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreRestaurante" className="flex items-center gap-2 cursor-pointer">
                    <Building className="w-4 h-4" />
                    Nombre del Restaurante
                  </Label>
                  <Input
                    id="nombreRestaurante"
                    type="text"
                    placeholder="El nombre comercial de tu restaurante"
                    value={formData.nombreRestaurante}
                    onChange={(e) => handleInputChange("nombreRestaurante", e.target.value)}
                    className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccionFiscal" className="flex items-center gap-2 cursor-pointer">
                    <MapPin className="w-4 h-4" />
                    Dirección Fiscal
                  </Label>
                  <Input
                    id="direccionFiscal"
                    type="text"
                    placeholder="Calle, número, colonia, ciudad, estado, CP"
                    value={formData.direccionFiscal}
                    onChange={(e) => handleInputChange("direccionFiscal", e.target.value)}
                    className="glass transition-all duration-300 focus:scale-[1.02] hover:glass-strong"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 glass rounded-lg border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-all duration-300">
                  <Checkbox
                    id="terminos"
                    checked={formData.aceptaTerminos}
                    onCheckedChange={(checked) => handleInputChange("aceptaTerminos", checked as boolean)}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="terminos" className="text-sm leading-relaxed cursor-pointer">
                    Acepto los{" "}
                    <Link href="/terminos" className="text-primary hover:underline font-medium cursor-pointer">
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacidad" className="text-primary hover:underline font-medium cursor-pointer">
                      Política de Privacidad
                    </Link>
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading}
                    className="flex-1 glass hover:bg-muted/50 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isStep2Valid() || isLoading}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        Registrar Restaurante
                        <ChefHat className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium transition-colors cursor-pointer">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}