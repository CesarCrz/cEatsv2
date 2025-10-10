import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { Home, Mail, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-bold text-sm">cE</span>
            </div>
            <span className="font-semibold text-xl">cEats</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Number */}
          <div className="relative mb-8">
            <div className="text-[180px] md:text-[240px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-800 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-16 h-16 md:w-24 md:h-24 text-blue-600/20" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida. Verifica la URL o regresa al inicio.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
            >
              <Link href="/">
                <Home className="w-5 h-5 mr-2" />
                Volver al inicio
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <Link href="/contact">
                <Mail className="w-5 h-5 mr-2" />
                Contactar soporte
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Enlaces útiles:</p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/planes" className="text-blue-600 hover:text-blue-800 hover:underline">
                Planes y precios
              </Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-800 hover:underline">
                Contacto
              </Link>
              <Link href="/terms-of-service" className="text-blue-600 hover:text-blue-800 hover:underline">
                Términos y condiciones
              </Link>
              <Link href="/privacy-policies" className="text-blue-600 hover:text-blue-800 hover:underline">
                Política de privacidad
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
