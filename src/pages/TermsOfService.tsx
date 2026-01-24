import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
  const navigate = useNavigate();
  const lastUpdated = "24 de enero de 2025";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-14 items-center px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Términos y Condiciones</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl px-4 py-8">
        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
          <div className="text-center mb-8">
            <img 
              src="/logo-sportpago.png" 
              alt="SportPago" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Términos y Condiciones de Uso
            </h1>
            <p className="text-muted-foreground">
              Última actualización: {lastUpdated}
            </p>
          </div>

          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                1. Aceptación de los Términos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Al acceder y utilizar SportPago ("la Aplicación", "el Servicio"), usted acepta 
                cumplir con estos Términos y Condiciones de Uso. Si no está de acuerdo con 
                alguno de estos términos, no debe utilizar la Aplicación.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                2. Descripción del Servicio
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                SportPago es una plataforma de gestión de pagos diseñada para academias, clubes 
                y establecimientos deportivos. Permite a los administradores gestionar deportistas, 
                registrar pagos, controlar vencimientos y generar reportes financieros.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                3. Registro y Cuenta
              </h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Debe proporcionar información precisa y actualizada al registrarse</li>
                <li>Es responsable de mantener la confidencialidad de sus credenciales</li>
                <li>Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta</li>
                <li>No puede compartir su cuenta con terceros sin autorización</li>
                <li>Debe ser mayor de 18 años para crear una cuenta de administrador</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                4. Uso Aceptable
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Usted se compromete a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Usar el Servicio solo para fines legales y autorizados</li>
                <li>No intentar acceder a datos de otros usuarios sin autorización</li>
                <li>No interferir con el funcionamiento normal del Servicio</li>
                <li>No cargar contenido malicioso, ilegal o que viole derechos de terceros</li>
                <li>No realizar ingeniería inversa o intentar extraer el código fuente</li>
                <li>Cumplir con las leyes locales de protección de datos al gestionar información de deportistas</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                5. Datos y Privacidad
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                El uso de sus datos está regido por nuestra Política de Privacidad. Al utilizar 
                el Servicio, usted reconoce haber leído y aceptado dicha política. Como administrador, 
                usted es responsable de obtener los consentimientos necesarios de los deportistas 
                cuyos datos registra en la plataforma.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                6. Propiedad Intelectual
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                SportPago y todo su contenido, características y funcionalidad son propiedad 
                de SportPago y están protegidos por leyes de propiedad intelectual. No se le 
                otorga ningún derecho sobre la propiedad intelectual más allá del uso limitado 
                del Servicio según estos términos.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                7. Limitación de Responsabilidad
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                SportPago se proporciona "tal cual" y "según disponibilidad". No garantizamos 
                que el Servicio sea ininterrumpido o libre de errores. En la máxima medida 
                permitida por la ley, no seremos responsables por daños indirectos, incidentales, 
                especiales o consecuentes que resulten del uso o la imposibilidad de usar el Servicio.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                8. Indemnización
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Usted acepta indemnizar y mantener indemne a SportPago de cualquier reclamo, 
                daño, pérdida, responsabilidad y gastos que surjan de su uso del Servicio o 
                violación de estos términos.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                9. Modificaciones del Servicio
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio 
                en cualquier momento, con o sin previo aviso. También podemos actualizar estos 
                términos periódicamente. El uso continuado del Servicio después de dichas 
                modificaciones constituye su aceptación de los nuevos términos.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                10. Terminación
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos suspender o terminar su acceso al Servicio en cualquier momento por 
                violación de estos términos o por cualquier otra razón a nuestra discreción. 
                Usted puede cancelar su cuenta en cualquier momento desde la configuración 
                de la aplicación.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                11. Ley Aplicable
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Estos términos se regirán e interpretarán de acuerdo con las leyes del país 
                donde se encuentre registrado SportPago, sin tener en cuenta sus conflictos 
                de disposiciones legales.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                12. Contacto
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Para preguntas sobre estos Términos y Condiciones, contáctenos a:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <p className="text-foreground font-medium">SportPago</p>
                <p className="text-muted-foreground">Email: legal@sportpago.com</p>
                <p className="text-muted-foreground">Soporte: soporte@sportpago.com</p>
              </div>
            </div>
          </section>

          <div className="mt-12 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SportPago. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
