"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"


export default function VerifyEmailPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return // Solo un dígito por input

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)  

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Actualiza la función handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const verificationCode = code.join("")

    if (verificationCode.length !== 6) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: user?.email, 
          code: verificationCode 
        }),
      })

      const data = await response.json()
      console.log('Respuesta del servidor:', JSON.stringify(data))

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar el código')
      }
      // Mostrar toast de éxito
      toast({
        title: "¡Verificación exitosa!",
        description: "Tu correo ha sido verificado correctamente.",
        variant: "default",
      })

      // Debug del router
      console.log('🚀 Redirigiendo al dashboard...')
      console.log('🔍 Router object:', router)
      console.log('🔍 Router.push function:', typeof router.push)
      
      // Múltiples métodos para redirección
      try {
        console.log('⏳ Intentando router.push con timeout...')
        
        setTimeout(() => {
          console.log('🔄 Ejecutando router.push dentro del timeout...')
          router.push('/dashboard')
          console.log('✅ router.push ejecutado')
        }, 1500)
        
        // Método alternativo con replace
        setTimeout(() => {
          console.log('🔄 Intentando router.replace como backup...')
          router.replace('/dashboard')
        }, 3000)
        
        // Método alternativo con window.location
        setTimeout(() => {
          console.log('🔄 Intentando window.location.href como último recurso...')
          window.location.href = '/dashboard'
        }, 4500)
        
      } catch (routerError) {
        console.error('💥 Error en router:', routerError)
        // Fallback a window.location
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      }

    } catch (error: any) {
      console.error('Error:', error)
      // Mostrar toast de error
      toast({
        title: "Error de verificación",
        description: error.message || "No se pudo verificar el código. Inténtalo nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Actualiza la función handleResendCode
const handleResendCode = async () => {
  setIsResending(true)
  console.log(`ENVIANDO AL EMAIL: ${JSON.stringify({ email: user?.email })}`)

  try {
    console.log('🔄 Iniciando fetch...')

    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: user?.email }),
    })

    let data
    data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al reenviar el código')
    }

    console.log('enviando el toast al ui')
    toast({
      title: "Código reenviado",
      description: "Hemos enviado un nuevo código a tu correo electrónico.",
      variant: "default",
    })
    
  } catch (error: any) {
    toast({
      title: "Error al reenviar",
      description: error.message || "No se pudo reenviar el código. Inténtalo nuevamente.",
      variant: "destructive",
    })
  } finally {
    setIsResending(false)
  }
}

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <Card className="w-full max-w-md glass-strong relative z-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center animate-glow">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Verifica tu correo</CardTitle>
            <CardDescription className="text-base mt-2">
              Hemos enviado un código de 6 dígitos a tu correo electrónico
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {inputRefs.current[index] = el}}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold glass rounded-lg border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 focus:scale-110"
                  />
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Ingresa el código de verificación que recibiste
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || code.join("").length !== 6}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Verificar y Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-muted-foreground">¿No recibiste el código?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  "Reenviar código"
                )}
              </Button>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
