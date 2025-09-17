"use client"

import { useToast } from "@/hooks/use-toast"

interface NotificationOptions {
  title?: string
  description: string
  duration?: number
}

export function useNotifications() {
  const { toast } = useToast()

  const showSuccess = ({ title = "Éxito", description, duration = 4000 }: NotificationOptions) => {
    toast({
      title,
      description,
      duration,
      variant: "default",
      className: "border-green-200 bg-green-50 text-green-800",
    })
  }

  const showInfo = ({ title = "Información", description, duration = 4000 }: NotificationOptions) => {
    toast({
      title,
      description,
      duration,
      variant: "default", 
      className: "border-blue-200 bg-blue-50 text-blue-800",
    })
  }

  const showWarning = ({ title = "Advertencia", description, duration = 6000 }: NotificationOptions) => {
    toast({
      title,
      description,
      duration,
      variant: "default",
      className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    })
  }

  const showError = ({ title = "Error", description, duration = 8000 }: NotificationOptions) => {
    toast({
      title,
      description,
      duration,
      variant: "destructive",
      className: "border-red-200 bg-red-50 text-red-800",
    })
  }

  // Función para manejar respuestas de API automáticamente
  const handleApiResponse = async (response: Response, options?: {
    successMessage?: string
    loadingMessage?: string
  }) => {
    try {
      const data = await response.json()
      
      if (response.ok) {
        if (options?.successMessage) {
          showSuccess({ description: options.successMessage })
        }
        return { success: true, data }
      } else {
        // Manejar diferentes tipos de errores del backend
        let errorMessage = "Ha ocurrido un error inesperado"
        
        if (data.error) {
          // Usar el mensaje del backend si no es un error interno
          errorMessage = data.error
        } else if (response.status === 400) {
          errorMessage = "Los datos enviados no son válidos"
        } else if (response.status === 401) {
          errorMessage = "No tienes autorización para realizar esta acción"
        } else if (response.status === 403) {
          errorMessage = "No tienes permisos para realizar esta acción"
        } else if (response.status === 404) {
          errorMessage = "El recurso solicitado no fue encontrado"
        } else if (response.status === 429) {
          errorMessage = "Has excedido el límite de solicitudes. Intenta más tarde"
        } else if (response.status >= 500) {
          errorMessage = "Error interno del servidor. Por favor, intenta más tarde"
        }

        showError({ description: errorMessage })
        return { success: false, error: errorMessage, data }
      }
    } catch (error) {
      // Error de red o parsing JSON
      showError({ 
        description: "Error de conexión. Verifica tu conexión a internet e intenta nuevamente" 
      })
      return { success: false, error: "Network error" }
    }
  }

  // Función para manejar errores de validación de formularios
  const showValidationError = (fieldName: string, message?: string) => {
    const defaultMessage = `El campo "${fieldName}" es requerido`
    showWarning({ 
      title: "Campo requerido",
      description: message || defaultMessage,
      duration: 5000
    })
  }

  // Función para mostrar errores de validación múltiples
  const showValidationErrors = (errors: { field: string; message: string }[]) => {
    if (errors.length === 1) {
      showValidationError(errors[0].field, errors[0].message)
    } else {
      const errorCount = errors.length
      const firstErrors = errors.slice(0, 3).map(e => `• ${e.field}`).join('\n')
      const description = errorCount <= 3 
        ? `Por favor, completa los siguientes campos:\n${firstErrors}`
        : `Por favor, completa los siguientes campos:\n${firstErrors}\n• ... y ${errorCount - 3} más`
      
      showWarning({
        title: "Campos requeridos",
        description,
        duration: 7000
      })
    }
  }

  return {
    showSuccess,
    showInfo,
    showWarning,
    showError,
    handleApiResponse,
    showValidationError,
    showValidationErrors
  }
}

export default useNotifications