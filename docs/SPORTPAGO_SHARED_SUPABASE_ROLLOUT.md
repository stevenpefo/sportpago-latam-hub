# SportPago internacional: una sola base Supabase para Colombia y USA

**Decisión 28/10/2026:** mantener Supabase Free actual para ambos países. No crear proyecto adicional. Los entrenadores de Colombia siguen en Lovable sin interrupción.

## Paso 1 — auditoría sin riesgo
Abrir `docs/sql/03_AUDIT_EXISTING_SUPABASE_READ_ONLY.sql`, ejecutarlo desde SQL Editor de Supabase EXISTENTE y compartir el resultado. Es únicamente SELECT sobre metadatos. Confirma tablas, columnas, funciones y RLS, sin revelar datos personales de deportistas.

## Paso 2 — migración aditiva, todavía NO aprobada ni aplicada
Tras estudiar el resultado del paso 1, preparar script de cambios exclusivamente **CREATE** de nuevas tablas `club_join_links` y `athlete_join_requests`, índices, políticas y RPC relacionadas, evitando recrear, alterar o borrar tablas existentes de clubes, atletas y pagos. Revisión previa de conflictos, permisos y restauración.
**NO ejecutar `docs/sql/01_BOOTSTRAP_USA_STAGING_ONLY.sql` en la base existente.** Ese archivo es para instalaciones vacías y fallará por su protección.

## Paso 3 — UI con acceso controlado
La rama `feat/club-self-enrollment-staging` tiene una función desactivada por defecto; no está desplegada en Colombia. El mecanismo actual de despliegue Vercel rechaza Supabase existente por su protección de aislamiento. **Después de auditar la base** se reemplazará por un mecanismo de publicación consciente para compartir el backend, con feature flag exclusivo de la URL de pruebas, permitiendo que solo el proyecto de frontend de pruebas muestre los botones. No modificar la URL de producción de Lovable, ni Capacitor, ni los roles/pagos existentes.
Revisar también los Auth Redirect URLs específicos para la URL de preview cuando se conozca.

## Paso 4 — pruebas de dos clubes
Usar dos clubes ficticios o usuarios de ensayo autorizados; confirmar que la invitación A no registra en club B, que pendientes no afectan pagos y que aprobar solo es posible por el administrador correcto. Para menores, deben intervenir padres o tutores. Sin correo/Resend en esta fase: formulario + aprobación.
Para futuros correos con Resend, las claves privadas solo en funciones seguras del servidor.

## Control de cambios
No fusionar PR #2 ni publicar a la app Lovable de Colombia durante estas pruebas. Mantener respaldo exportable de datos antes de aplicar migraciones en la base existente.
