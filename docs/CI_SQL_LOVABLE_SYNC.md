# SportPago Internacional — desarrollo por GitHub + SQL, sin consumir Lovable

Fecha: 2026-10-28. Objetivo: una aplicación internacional sobre el Supabase existente, sin duplicar servidores.

## Estado comprobado
- Lovable `SportPago supa` lleva a Supabase: `myqrrmtubfqlnnqdoams`.
- SQL 04 de autoinscripción instalado por el propietario; enlaces y solicitudes arrancaron en 0.
- El propietario mostró RLS activado para las dos tablas nuevas, sin SELECT/INSERT directo anónimo, y permisos de cinco RPC.
- La versión de Lovable ya incluye una actualización de idiomas no publicada (13 pruebas informadas por Lovable).
- **PENDIENTE CRÍTICO:** comprobar en **Project settings → Git → GitHub** el repositorio y la rama activa. El `main` de `stevenpefo/sportpago-latam-hub` aún tiene landing comercial diferente y referencia de Supabase antigua, por lo que **NO es seguro fusionar nuestra rama** sin reconciliar el código más reciente de Lovable.

## SQL automatizable con ejecución manual (base real, cero modificaciones)
`docs/sql/06_QA_SECURITY_CONTRACT_READ_ONLY.sql`:
20 verificaciones de esquema, RLS, ACL, funciones, enlaces y referencias.
El SQL no contiene INSERT/UPDATE/DELETE/ALTER/CREATE ni consulta datos personales.
Resultado esperado: todas las filas `PASS`. Si aparece `FAIL`, detener publicación y revisar.

## Workflows de GitHub ya preparados
1. **SportPago - comprobaciones antes de APK** (`.github/workflows/pre-apk.yml`): `npm ci`, validación de traducciones, controles del código de enlaces, aislamiento de la configuración, **TypeScript** y build Vite.
2. **SportPago - pruebas web internacionales sin datos reales** (`.github/workflows/international-web.yml`): abre Chromium en GitHub, simula el backend sin guardar datos reales; comprueba formulario en los 4 idiomas, token de club, acceso móvil, envío, consentimiento y preferencia almacenada.
3. **SportPago - API de Supabase sin tocar datos reales** (`.github/workflows/supabase-live-readonly.yml`): workflow manual opcional (requiere `SPORTPAGO_SUPABASE_ANON_KEY` en GitHub Secrets); verifica que visitantes no lean tablas ni ejecuten funciones administrativas, rechaza enlace inválido. **No usa tokens válidos y no crea inscripciones**. GitHub solo muestra ejecución manual tras llevar el archivo al branch por defecto.
4. Ninguno de estos workflows demuestra todavía aprobación real con un usuario/club; ese caso requiere cuenta de pruebas autorizada y posteriormente verificación funcional aislada.

## Sincronización correcta de Lovable
Lovable permite sincronización bidireccional **solo con el repositorio y la rama activos en Project settings → Git → GitHub**. El repositorio y rama deben identificarse antes de publicar o fusionar. No confundir con `More → Supabase` ni con el conector genérico de GitHub del workspace.

Flujo:
1. Confirmar repo y branch de Lovable, y estado `In sync`.
2. Comparar el código actual de Lovable (incluidos los cambios recientes de idiomas/autoinscripción) con la rama candidata; integrar sin sobrescribir las modificaciones más recientes.
3. Cada push/PR ejecuta Actions. NO fusionar ni cambiar rama activa con checks fallidos.
4. Cuando la rama sincronizada recibe commits, Lovable actualiza **editor/vista previa**. Su página pública **NO se publica sola**. Tras aprobación, publicar desde Lovable.
5. No requiere Vercel ni más prompts grandes de Lovable.

## Alcance y seguridad antes de familias reales
- RLS/ACL y pruebas de navegador son verificaciones diferentes; los tests con mocks no prueban los permisos de datos reales.
- Validación multi-club, protección anti-abuso, privacidad de menores y consistencia de la aprobación de atletas todavía deben realizarse antes de compartir enlaces públicamente.
- No tocar ni regenerar pagos existentes, ni ejecutar scripts de bootstrap de bases vacías.
