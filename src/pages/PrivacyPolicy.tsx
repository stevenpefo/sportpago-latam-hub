import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
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
          <h1 className="font-semibold">Política de Privacidad</h1>
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
              Política de Privacidad
            </h1>
            <p className="text-muted-foreground">
              Última actualización: {lastUpdated}
            </p>
          </div>

          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                1. Introducción
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Bienvenido a SportPago. Nos comprometemos a proteger su privacidad y a manejar sus 
                datos personales de manera transparente. Esta Política de Privacidad explica cómo 
                recopilamos, usamos, almacenamos y protegemos su información cuando utiliza nuestra 
                aplicación móvil y servicios web.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Al utilizar SportPago, usted acepta las prácticas descritas en esta política. 
                Le recomendamos leer este documento detenidamente.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                2. Información que Recopilamos
              </h2>
              
              <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
                2.1 Información proporcionada por usted
              </h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Nombre completo y datos de contacto (correo electrónico, teléfono)</li>
                <li>Información del establecimiento deportivo (nombre, país, zona horaria)</li>
                <li>Datos de deportistas (nombre, contacto, categoría, fecha de nacimiento)</li>
                <li>Información de pagos y transacciones</li>
                <li>Credenciales de acceso (correo electrónico y contraseña encriptada)</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
                2.2 Información recopilada automáticamente
              </h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Datos de uso de la aplicación y navegación</li>
                <li>Información del dispositivo (tipo, sistema operativo, identificadores únicos)</li>
                <li>Dirección IP y datos de ubicación aproximada</li>
                <li>Registros de errores y rendimiento de la aplicación</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                3. Uso de la Información
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Utilizamos su información para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                <li>Gestionar su cuenta y autenticar su acceso</li>
                <li>Procesar y registrar transacciones de pago</li>
                <li>Enviar notificaciones sobre vencimientos y pagos pendientes</li>
                <li>Generar reportes y estadísticas para su establecimiento</li>
                <li>Comunicar actualizaciones importantes del servicio</li>
                <li>Detectar y prevenir fraudes o actividades no autorizadas</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                4. Compartición de Datos
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong>No vendemos sus datos personales.</strong> Podemos compartir información en las siguientes circunstancias:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Proveedores de servicios:</strong> Trabajamos con terceros que nos ayudan a operar la plataforma (alojamiento, análisis, soporte técnico)</li>
                <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley, orden judicial o autoridad gubernamental</li>
                <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, privacidad, seguridad o propiedad</li>
                <li><strong>Con su consentimiento:</strong> Cuando usted nos autorice expresamente</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                5. Seguridad de Datos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
                <li>Encriptación de datos en tránsito (TLS/SSL) y en reposo</li>
                <li>Autenticación segura y contraseñas encriptadas</li>
                <li>Control de acceso basado en roles (RLS)</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Copias de seguridad regulares</li>
                <li>Infraestructura en la nube con certificaciones de seguridad</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                6. Retención de Datos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Conservamos su información mientras su cuenta esté activa o según sea necesario para 
                proporcionarle servicios. Podemos retener ciertos datos después de la cancelación de 
                su cuenta para cumplir con obligaciones legales, resolver disputas y hacer cumplir 
                nuestros acuerdos. Los datos de transacciones se conservan por el período requerido 
                por las leyes fiscales aplicables.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                7. Sus Derechos
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Dependiendo de su ubicación, usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                <li><strong>Limitación:</strong> Restringir el procesamiento de sus datos</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Para ejercer estos derechos, contáctenos a través de los canales indicados al final de esta política.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                8. Cookies y Tecnologías Similares
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies y tecnologías similares para mantener su sesión, recordar sus 
                preferencias y analizar el uso de la aplicación. Puede configurar su navegador 
                para rechazar cookies, aunque esto puede afectar la funcionalidad del servicio.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                9. Menores de Edad
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                SportPago está diseñado para ser utilizado por administradores y personal de 
                establecimientos deportivos. No recopilamos intencionalmente información de 
                menores de 13 años sin el consentimiento de sus padres o tutores legales. 
                Los datos de deportistas menores de edad son gestionados por los administradores 
                del establecimiento, quienes son responsables de obtener los consentimientos necesarios.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                10. Transferencias Internacionales
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Sus datos pueden ser procesados en servidores ubicados en diferentes países. 
                Nos aseguramos de que cualquier transferencia internacional de datos cumpla 
                con las leyes aplicables y que se implementen las salvaguardas apropiadas 
                para proteger su información.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                11. Cambios a esta Política
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos 
                sobre cambios significativos a través de la aplicación o por correo electrónico. 
                La fecha de "última actualización" al inicio de este documento indica cuándo se 
                realizó la revisión más reciente.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-4">
                12. Contacto
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de 
                Privacidad o el manejo de sus datos personales, puede contactarnos a través de:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <p className="text-foreground font-medium">SportPago</p>
                <p className="text-muted-foreground">Email: privacidad@sportpago.com</p>
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
