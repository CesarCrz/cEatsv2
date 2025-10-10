import Link from "next/link"
import { ChefHat } from "lucide-react"
import { Footer } from "@/components/footer"

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
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
            <Link href="/privacidad" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
              Política de Privacidad →
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 flex-1">
        <div className="mx-auto max-w-4xl">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Términos y Condiciones de Uso</h1>
            <p className="text-lg text-gray-600">
              Contrato de Prestación de Servicios Tecnológicos y Licencia de Uso de Plataforma (B2B)
            </p>
          </div>

          {/* Document Content */}
          <div className="prose prose-gray max-w-none">
            {/* Partes */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                Entre: <strong>C EATS2</strong> ("Proveedor"), con domicilio para oír y recibir notificaciones en Sta.
                Catalina de Siena 1065, Rinconada Del Valle, 45047 Zapopan, Jal., correo:{" "}
                <a href="mailto:info@ceats.app" className="text-blue-600 hover:underline">
                  info@ceats.app
                </a>
                , y el restaurante o comercio contratante ("Cliente"), cuyos datos constan en la Orden/Plan de servicio
                correspondiente. En conjunto, las "Partes".
              </p>
            </section>

            {/* Objeto */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Objeto</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                El Proveedor otorga al Cliente acceso a una plataforma tecnológica que permite recibir y gestionar
                pedidos iniciados por WhatsApp y/o otros canales habilitados (la "Plataforma"), así como servicios
                relacionados de soporte. El Proveedor no vende alimentos, no realiza entregas y no custodia fondos del
                consumidor final.
              </p>
            </section>

            {/* 1. Vigencia */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Vigencia y renovación</h2>
              <p className="text-gray-700 leading-relaxed">
                Este Contrato entra en vigor a la fecha de aceptación por parte del Cliente (aceptación electrónica) y
                tendrá vigencia mensual con renovación automática, salvo aviso de no renovación con 15 (quince) días
                naturales de antelación al siguiente periodo.
              </p>
            </section>

            {/* 2. Modelo comercial */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Modelo comercial y precios</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-relaxed">
                <li>
                  <strong>Inscripción (pago único):</strong> $2,000.00 MXN + IVA por alta de cuenta y configuración
                  inicial. No reembolsable, salvo error imputable al Proveedor.
                </li>
                <li>
                  <strong>Mensualidad:</strong> $1,000.00 MXN + IVA por sucursal/instancia/plan, por adelantado al
                  inicio de cada periodo mensual.
                </li>
                <li>
                  <strong>Impuestos:</strong> Los precios se entienden antes de IVA u otros tributos aplicables.
                </li>
              </ul>
            </section>

            {/* 3. Facturación */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Facturación, pagos y mora</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                El Proveedor emitirá CFDI conforme a la normativa fiscal aplicable. El Cliente deberá pagar dentro de 5
                (cinco) días naturales a partir de la fecha del CFDI. El incumplimiento genera interés moratorio de 3%
                mensual (o el máximo legal permitido) y faculta al Proveedor a suspender la Plataforma si transcurren 48
                horas desde el vencimiento sin regularización.
              </p>
            </section>

            {/* 4. Ausencia de custodia */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Ausencia de custodia de fondos del consumidor
              </h2>
              <p className="text-gray-700 leading-relaxed">
                El Cliente es quien cobra al consumidor final (en efectivo o mediante sus propias pasarelas/medios). El
                Proveedor no procesa, recibe ni retiene pagos del consumidor final, ni asume contracargos, fraudes o
                conciliaciones de dichos cobros.
              </p>
            </section>

            {/* 5. WhatsApp */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. WhatsApp y servicios de terceros</h2>
              <p className="text-gray-700 leading-relaxed">
                El uso del canal WhatsApp se rige por sus políticas y términos. Cualquier suspensión o bloqueo derivado
                de incumplimiento del Cliente es de su exclusiva responsabilidad. Tarifas de mensajería/plantillas u
                otros cargos de terceros (p. ej., Meta) corren por cuenta del Cliente.
              </p>
            </section>

            {/* 6. Servicio */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Servicio, responsabilidades y cumplimiento al consumidor
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                La Plataforma transmite intenciones de pedido. La aceptación del pedido, preparación, calidad de
                alimentos, entrega/recolección, facturación al consumidor y atención postventa son responsabilidad del
                Cliente. El Cliente mantendrá menús, precios, cargos, alérgenos, tiempos y políticas claros, veraces y
                actualizados, cumpliendo la legislación de comercio con consumidores. El Proveedor brindará soporte
                razonable y podrá realizar mantenimientos programados.
              </p>
            </section>

            {/* 7. Seguridad */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Seguridad y acceso</h2>
              <p className="text-gray-700 leading-relaxed">
                El Cliente es responsable de sus credenciales, usuarios y permisos. El Proveedor podrá suspender accesos
                ante riesgos de seguridad, uso abusivo o presunto fraude, notificándolo al Cliente.
              </p>
            </section>

            {/* 8. Propiedad intelectual */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Propiedad intelectual</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>a)</strong> La Plataforma, su código, interfaces, documentación, marcas, logotipos, diseños y
                demás contenidos son propiedad del Proveedor o se usan bajo licencia.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>b)</strong> El Proveedor otorga al Cliente una licencia limitada, no exclusiva, intransferible y
                revocable para usar la Plataforma durante la vigencia de este Contrato, conforme a sus fines.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>c)</strong> Quedan prohibidos: ingeniería inversa, descompilación, extracción masiva de datos
                (scraping), cesión o sublicencia, y el uso fuera del ámbito contratado.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>d)</strong> Feedback: toda sugerencia o retroalimentación del Cliente podrá ser utilizada por el
                Proveedor para mejorar la Plataforma, sin obligación de atribución ni pago adicional.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>e)</strong> Datos del Cliente: los contenidos (menú, precios, marcas del Cliente) siguen siendo
                del Cliente; el Proveedor recibe una licencia de uso no exclusiva para mostrarlos en la Plataforma y
                materiales de soporte.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>f)</strong> El Proveedor podrá usar el nombre y logotipo del Cliente como caso de uso o
                referencia comercial, salvo instrucción en contrario por escrito del Cliente.
              </p>
            </section>

            {/* 9. Datos personales */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Datos personales y privacidad</h2>
              <p className="text-gray-700 leading-relaxed">
                Respecto de datos del consumidor final y del personal del Cliente, el Cliente actúa como Responsable y
                el Proveedor como Encargado. Rige el{" "}
                <Link href="/privacidad" className="text-blue-600 hover:underline">
                  Anexo 1 (DPA)
                </Link>
                , que forma parte integral de este Contrato. El Proveedor aplicará medidas de seguridad razonables y
                tratará los datos únicamente conforme a instrucciones lícitas del Cliente.
              </p>
            </section>

            {/* 10. Declaraciones */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Declaraciones, garantías y nivel de servicio
              </h2>
              <p className="text-gray-700 leading-relaxed">
                El servicio se presta "tal cual", sin garantía de disponibilidad ininterrumpida ni de resultados
                específicos (ventas, posicionamiento), salvo lo expresamente pactado por escrito. El Proveedor empleará
                mejores esfuerzos para mantener la operación y resolver incidencias.
              </p>
            </section>

            {/* 11. Indemnización */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnización</h2>
              <p className="text-gray-700 leading-relaxed">
                El Cliente indemnizará y mantendrá en paz y a salvo al Proveedor frente a reclamaciones de terceros
                (consumidores, autoridades, plataformas) derivadas de su oferta de productos, publicidad, entregas,
                tratamiento de datos bajo sus instrucciones o incumplimientos legales.
              </p>
            </section>

            {/* 12. Limitación */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Limitación de responsabilidad</h2>
              <p className="text-gray-700 leading-relaxed">
                La responsabilidad total del Proveedor hacia el Cliente se limita al monto efectivamente pagado por el
                Cliente al Proveedor por la Plataforma en los 12 (doce) meses previos al evento. En ningún caso el
                Proveedor responde por daños indirectos (lucro cesante, daño moral, pérdida de reputación) ni por actos
                u omisiones de terceros.
              </p>
            </section>

            {/* 13. Cambios */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                13. Cambios a Términos, Precios y Planes (sin previo aviso)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                El Proveedor podrá modificar en cualquier momento estos Términos, así como precios y planes, sin
                obligación de notificar individualmente. La versión vigente estará disponible en esta página con su
                fecha de actualización y aplicará desde su publicación. Si el Cliente no está de acuerdo, podrá terminar
                el Contrato dentro de 10 (diez) días naturales siguientes a la publicación (sin penalización y sin
                reembolsos del periodo en curso). El uso continuo de la Plataforma después de ese plazo implica
                aceptación de los cambios.
              </p>
            </section>

            {/* 14. Confidencialidad */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Confidencialidad</h2>
              <p className="text-gray-700 leading-relaxed">
                Las Partes mantendrán confidencial la información técnica, comercial y de negocios a la que accedan por
                este Contrato, durante su vigencia y 3 (tres) años posteriores, salvo requerimiento legal.
              </p>
            </section>

            {/* 15. Suspensión */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Suspensión y terminación</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Cualquiera de las Partes podrá terminar este Contrato con 30 (treinta) días naturales de aviso. El
                Proveedor podrá terminar de inmediato por: (i) falta de pago; (ii) uso ilícito o que infrinja políticas
                de plataformas; (iii) riesgos de seguridad graves. A la terminación: cesa la licencia; el tratamiento de
                datos se rige por el Anexo 1 (DPA).
              </p>
            </section>

            {/* 16. Notificaciones */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Notificaciones y contacto</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                <strong>Notificaciones al Proveedor:</strong> Sta. Catalina de Siena 1065, Rinconada Del Valle, 45047
                Zapopan, Jal. y/o{" "}
                <a href="mailto:info@ceats.app" className="text-blue-600 hover:underline">
                  info@ceats.app
                </a>
                . Las del Cliente conforme a los datos de su Orden/Plan.
              </p>
            </section>

            {/* 17. Ley aplicable */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Ley aplicable y jurisdicción</h2>
              <p className="text-gray-700 leading-relaxed">
                Este Contrato se regirá por las leyes de México. Para cualquier controversia, las Partes se someten a
                los tribunales competentes de Guadalajara, Jalisco.
              </p>
            </section>

            {/* Vigencia */}
            <section className="mb-12">
              <p className="text-gray-700 leading-relaxed font-medium">
                Fecha de entrada en vigor: a la fecha de aceptación del contrato por el Cliente.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
