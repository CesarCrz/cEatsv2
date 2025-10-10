'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

export default function SuccessPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setStatus('error')
      setMessage('No se encontró la sesión de pago')
      return
    }

    // Verificar el pago con el backend
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setStatus('success')
          setMessage('¡Tu suscripción ha sido activada exitosamente!')
          
          // Redirigir al dashboard después de 3 segundos
          setTimeout(() => {
            router.push(`/dashboard/restaurantes/${params.id}`)
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Hubo un problema al verificar tu pago')
        }
      } catch (error) {
        console.error('Error verificando pago:', error)
        setStatus('error')
        setMessage('Error al verificar el pago. Por favor contacta a soporte.')
      }
    }

    verifyPayment()
  }, [searchParams, router, params.id])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
              <CardTitle>Verificando tu pago...</CardTitle>
              <CardDescription>Por favor espera un momento</CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <CardTitle>¡Pago Exitoso!</CardTitle>
              <CardDescription>Tu suscripción ha sido activada</CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <CardTitle>Error en el Pago</CardTitle>
              <CardDescription>Hubo un problema</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              Serás redirigido automáticamente en unos segundos...
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button
                onClick={() => router.push(`/dashboard/restaurantes/${params.id}/planes`)}
                className="w-full"
              >
                Volver a Planes
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/restaurantes/${params.id}`)}
                variant="outline"
                className="w-full"
              >
                Ir al Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
