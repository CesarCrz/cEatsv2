import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  // Este componente nunca debería verse porque el middleware redirige
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4"/>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  )
}