-- SPORTPAGO - AUDITORÍA DE LA BASE EXISTENTE (CO + USA)
-- 100 % SOLO LECTURA. No crea/modifica/elimina datos ni tablas.
-- Ejecutar en Supabase SQL Editor > Run. Compartir solamente la salida.
-- NO ejecutar docs/sql/01_BOOTSTRAP_USA_STAGING_ONLY.sql en la base existente.

WITH tablas_requeridas(nombre) AS (
  VALUES ('establecimientos'), ('athletes'), ('profiles'), ('user_roles'),
         ('payment_methods'), ('transactions'), ('staff_users'),
         ('club_join_links'), ('athlete_join_requests')
),
tablas AS (
  SELECT
    t.nombre,
    to_regclass(format('public.%I', t.nombre)) IS NOT NULL AS existe,
    COALESCE(c.relrowsecurity, false) AS rls_activado
  FROM tablas_requeridas t
  LEFT JOIN pg_catalog.pg_class c
    ON c.oid = to_regclass(format('public.%I', t.nombre))
),
columnas AS (
  SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND (
      (table_name = 'establecimientos' AND column_name IN (
        'id','admin_id','nombre','pais','moneda','simbolo_moneda',
        'codigo_club','zona_horaria','configuracion_completa'))
      OR (table_name = 'athletes' AND column_name IN (
        'id','establecimiento_id','nombre','deporte','telefono','email',
        'monto_mensual','dia_pago','proximo_pago','estado_manual',
        'validado','agregado_por'))
      OR (table_name = 'athlete_join_requests' AND column_name IN (
        'id','establecimiento_id','link_id','estado','contacto_email'))
      OR (table_name = 'club_join_links' AND column_name IN (
        'id','establecimiento_id','token','activo'))
    )
),
funciones AS (
  SELECT
    p.proname,
    pg_catalog.pg_get_function_identity_arguments(p.oid) AS argumentos
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'get_user_establecimiento_id','has_role',
      'verify_club_code','verify_staff_access',
      'ensure_club_join_link','rotate_club_join_link',
      'get_club_join_info','submit_club_join_request',
      'review_club_join_request'
    )
),
politicas AS (
  SELECT tablename, policyname, cmd, roles
  FROM pg_catalog.pg_policies
  WHERE schemaname='public'
    AND tablename IN (
      'establecimientos','athletes','club_join_links','athlete_join_requests')
)
SELECT jsonb_pretty(
  jsonb_build_object(
    'tipo', 'auditoria_solo_lectura',
    'base', current_database(),
    'tablas', COALESCE((SELECT jsonb_agg(to_jsonb(t) ORDER BY nombre) FROM tablas t), '[]'::jsonb),
    'columnas_clave', COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY table_name, column_name) FROM columnas c), '[]'::jsonb),
    'funciones', COALESCE((SELECT jsonb_agg(to_jsonb(f) ORDER BY proname) FROM funciones f), '[]'::jsonb),
    'politicas', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY tablename, policyname) FROM politicas p), '[]'::jsonb)
  )
) AS resultado;
