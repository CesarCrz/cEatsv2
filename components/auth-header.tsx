import Link from "next/link"
import { ChefHat } from "lucide-react"

export function AuthHeader() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              cEats v2
            </span>
          </Link>
          <Link 
            href="/" 
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </header>
  )
}
