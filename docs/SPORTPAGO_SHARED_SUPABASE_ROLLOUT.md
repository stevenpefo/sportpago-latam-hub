# SportPago internacional — Supabase compartido Colombia + USA

**Decisión confirmada 28/10/2026:** reutilizar Supabase Free existente, sin crear otro proyecto. Los clubes colombianos continúan en la URL de Lovable; el frontend internacional se probará en una URL web distinta conectada al mismo backend, con permisos por club.

## Auditoría que compartió el propietario
Existen y tienen RLS activo: `athletes`, `establecimientos`, `payment_methods`, `profiles`, `staff_users`, `transactions`, `user_roles`. No existen aún `athlete_join_requests` ni `club_join_links`. La inspección de columnas que lleva el nuevo SQL también debe aprobarse antes de efectuar cambios.

## Paso siguiente: instalar solo la autoinscripción
**Previamente:** respaldar/exportar las tablas críticas `athletes`, `establecimientos`, `transactions` y guardar el esquema SQL actual.

**Ejecutar SOLO UNA VEZ:** `docs/sql/04_ADD_CLUB_SELF_REGISTRATION_EXISTING_SUPABASE.sql` en SQL Editor del Supabase actual. Es una transacción protegida: comprueba tablas, columnas, RLS y posibles conflictos con las cinco funciones nuevas antes de crear nada. Instala dos tablas nuevas y sus permisos; no actualiza ni borra filas existentes de `athletes` o `transactions`.

**Resultado esperado:** `OK - autoinscripción instalada sin alterar las tablas existentes`, `enlaces_iniciales = 0`, `solicitudes_iniciales = 0`. Si arroja error, no repetir a ciegas; enviar el mensaje completo.

**NUNCA EJECUTAR** `docs/sql/01_BOOTSTRAP_USA_STAGING_ONLY.sql` en Supabase actual: recrea el esquema entero y es solo para proyecto vacío.

## Frontend web USA/preview
Branch: `feat/club-self-enrollment-staging`; PR borrador #2. Archivo `vercel.json` configura fallback para rutas web `/join/:token` y exige el control `scripts/assert-shared-preview-env.mjs` antes de construir.

Variables en Vercel **solo para este nuevo sitio preview**, nunca Lovable Colombia:
- `VITE_DEPLOY_TARGET=preview-shared`
- `VITE_ENABLE_CLUB_INVITES=true`
- `VITE_SUPABASE_PROJECT_ID=chklvnjudaschthbqgsc`
- `VITE_SUPABASE_URL=https://chklvnjudaschthbqgsc.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = la **clave pública anon/publishable**, no service_role ni secret key. Configurarla en Vercel, no guardar en Git.

El frontend preview comparte datos existentes, por lo que **no es un sandbox de datos**. Usar solicitudes ficticias, no datos reales de menores mientras no se completen medidas de privacidad. No fusionar PR #2 ni cambiar URL de Lovable o configuración de APK.

## Pruebas obligatorias antes del lanzamiento público
1. Dos entrenadores con clubes distintos (preferiblemente cuentas ficticias). Verificar que las vistas no muestran datos del otro.
2. Crear enlace A, enviar solicitud anónima de un deportista ficticio, ver pendientes y aprobarla con admin A.
3. Probar enlace B, rechazar, revocar/rotar token, duplicados y datos malformados.
4. Reconfirmar inserción manual de deportistas y operaciones de pagos con datos ficticios (sin tocar transacciones reales).
5. Revisar la política de privacidad, consentimiento verificable en casos de menores, CAPTCHA/anti-spam y retención de datos antes de compartir el enlace con familias reales.
6. Verificar registro desde Safari en iPhone y Chrome en Android, sin instalación obligatoria.

## Resend
No es necesario en este primer paso. Solo después, para avisos transaccionales; claves en funciones seguras del servidor, nunca variables `VITE_*`.

## Estado
- Auditoría: siete tablas existentes con RLS y dos pendientes verificadas por el usuario.
- SQL 04: escrito, todavía NO ejecutado en la base compartida.
- Web preview: código preparado, todavía SIN enlace desplegado.
- Producción Colombia: aún sin cambios de esquema ni frontend a través de este flujo.
