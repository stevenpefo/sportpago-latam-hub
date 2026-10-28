> **CAMBIO DE DECISIÓN — 28/10/2026:** SportPago USA y Colombia compartirán el Supabase Free que ya existe. Esta guía de proyecto nuevo queda archivada y **NO debe seguirse** para el despliegue acordado. Primero ejecutar únicamente `docs/sql/03_AUDIT_EXISTING_SUPABASE_READ_ONLY.sql`; después preparar una migración aditiva revisada. La protección del preview que exige Supabase separado sigue bloqueando despliegues con la base actual hasta adaptarla después de la auditoría.

# SportPago USA — entorno de pruebas aislado (28 Oct 2026)

## Objetivo
Probar la inscripción de deportistas y padres desde un enlace de cada club, sin afectar el
sitio Lovable de Colombia ni sus usuarios, bases de datos, entrenadores, deportistas o pagos.

### NO HACER
- No modificar la URL de Lovable que utilizan los clubes colombianos.
- No ejecutar `20261028120000_club_self_enrollment.sql` en Supabase Colombia.
- No cargar datos reales de menores ni exportar deportistas colombianos para estas pruebas.
- No usar `.env` de `main` ni sus credenciales.
- No fusionar el PR #2 con `main` mientras no estén aprobadas las pruebas.

## Preparación rápida para ejecutar SQL manualmente

En un proyecto Supabase **nuevo, sin usuarios y sin tablas SportPago**, usa en este orden:
1. `docs/sql/01_BOOTSTRAP_USA_STAGING_ONLY.sql` — script combinado de 8 migraciones, con protección frente a tablas existentes y usuarios; se ejecuta en una sola transacción.
2. `docs/sql/02_VERIFY_USA_STAGING_READ_ONLY.sql` — consulta de verificación sin escritura.
Si el bootstrap da un error, **no vuelvas a ejecutarlo en otra base**; guarda el error completo y revísalo antes de hacer correcciones. No ejecutes estos archivos en el Supabase de Lovable Colombia. No cargues usuarios reales.

## 1. Supabase: proyecto NUEVO e independiente
1. Crear un proyecto en Supabase llamado por ejemplo `sportpago-usa-staging`.
2. Copiar solo la URL del proyecto, su referencia de proyecto y su **publishable key**.
   Nunca usar la secret/service_role key en variables VITE_* ni en el navegador.
3. Aplicar las migraciones existentes de la carpeta `supabase/migrations` en ese
   proyecto NUEVO. Revisar primero su compatibilidad y orden; este paso todavía
   NO está ejecutado ni validado de extremo a extremo.
4. Crear al menos dos usuarios de prueba (administradores), uno por club ficticio.
   Configurar clubes con país USA, moneda USD y zona horaria correcta para cada prueba.
5. Probar la migración nueva de enlaces y solicitudes de club en ese proyecto, no
   en Colombia. Asegurar que RLS esté activado y que no se puedan cruzar clubes.

## 2. Hospedaje web: Vercel NUEVO
Crear un proyecto Vercel independiente conectado al repositorio
`stevenpefo/sportpago-latam-hub`, con el branch de implementación:
`feat/club-self-enrollment-staging`. No enlazar ni reemplazar la app Lovable.

En **Environment Variables** configurar SOLAMENTE para el preview/staging
estas variables (en Vercel, no en archivos versionados):

| Variable | Valor |
| --- | --- |
| VITE_DEPLOY_TARGET | staging |
| VITE_ENABLE_CLUB_INVITES | true |
| VITE_SUPABASE_URL | https://PROJECT_REF_NUEVO.supabase.co |
| VITE_SUPABASE_PROJECT_ID | PROJECT_REF_NUEVO |
| VITE_SUPABASE_PUBLISHABLE_KEY | clave pública del proyecto NUEVO |

El código rechaza al proyecto Supabase de Colombia si se activa la autoinscripción.
El `vercel.json` facilita las rutas SPA como `/join/:token`.
Para producción futura se planeará una configuración y un despliegue separados.

## 3. Verificar antes del despliegue
- `npm ci`
- `node --test scripts/check-pre-apk.mjs scripts/check-club-enrollment.mjs scripts/check-staging-isolation.mjs`
- `node scripts/assert-staging-env.mjs` (con variables del proyecto de staging)
- `npm run build`

Existe un GitHub Actions manual `staging-preview-bundle.yml` que fabrica el paquete
web sólo cuando se configuran `STAGING_SUPABASE_URL`,
`STAGING_SUPABASE_PROJECT_ID` y `STAGING_SUPABASE_PUBLISHABLE_KEY`
en GitHub Actions Secrets. Este paquete NO es un enlace público ni despliega una app.

## 4. Pruebas funcionales con datos ficticios
1. Club A: entrenador genera enlace, copia y comparte por WhatsApp.
2. Padre abre en iPhone sin instalar; envía una solicitud de un deportista ficticio.
3. Entrenador A ve la solicitud en pendientes y aprueba.
4. Aparece el deportista en la lista existente con pago pendiente y tarifa 0
   (el entrenador ajusta la tarifa mensual como lo hace hoy).
5. Repetir en Android y desde navegador de escritorio.
6. Club B tiene otra URL; verificar que A no lee solicitudes de B ni al revés.
7. Probar rechazo, invitación rotada, enlace falso, duplicado y abuso de envío.
8. Verificar manualmente la inserción normal de atletas, pagos y transacciones
   con datos de prueba; asegurar que siguen sin cambios.
9. Cambiar de español a inglés, francés y portugués y revisar los formularios.
10. Revisar formato de moneda USD, zonas horarias, términos y privacidad para USA.

## 5. Antes de habilitar para familias reales en Estados Unidos
Pendientes obligatorios:
- Protección antiabuso adicional (CAPTCHA, límites fuertes en servidor/perímetro).
- Revisión legal de privacidad y recogida de datos de menores y acudientes.
- Comprobación de flujos de sesión/contraseña y recuperación de cuenta.
- Probar los casos de seguridad con dos clubes diferentes en un Supabase real aislado.
- Desplegar y validar desde Safari iPhone y Chrome Android.
- Decidir retención de solicitudes y el proceso para eliminar datos a petición.

## Estado
- Código de la función: preparado en rama, NO desplegado.
- CI para compilar/traducciones: implementado.
- Base de datos nueva: NO creada.
- Migración aplicada: NO.
- URL de preview pública: NO creada.
- Colombia: SIN CAMBIOS.
