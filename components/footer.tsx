import Link from "next/link"
import { ChefHat } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-muted-foreground"> cEats OPERADO POR OLIFOODS ALSOR SOLUTIONS © 2025. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link href="/privacy-policies" className="hover:text-blue-600 transition-colors">
              Privacidad
            </Link>
            <Link href="/terms-of-service" className="hover:text-blue-600 transition-colors">
              Términos
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">
              Soporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
