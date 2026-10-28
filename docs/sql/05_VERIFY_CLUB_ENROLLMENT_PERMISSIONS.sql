-- SPORTPAGO: verificacion SOLO LECTURA de autoinscripcion.
-- Ejecutar en el mismo proyecto en el cual se instalo SQL 04.
-- No muestra datos personales, tokens, claves, ni modifica tablas.
SELECT
  t.table_name AS tabla,
  c.relrowsecurity AS rls_activo,
  has_table_privilege('anon', c.oid, 'SELECT') AS anon_puede_leer,
  has_table_privilege('anon', c.oid, 'INSERT') AS anon_puede_insertar,
  has_table_privilege('authenticated', c.oid, 'SELECT') AS usuarios_pueden_consultar
FROM (VALUES ('club_join_links'), ('athlete_join_requests')) AS t(table_name)
JOIN pg_catalog.pg_class c ON c.oid = to_regclass('public.' || t.table_name)
ORDER BY t.table_name;

SELECT
  p.proname AS funcion,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_puede_ejecutar,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS usuario_puede_ejecutar
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'ensure_club_join_link',
    'rotate_club_join_link',
    'get_club_join_info',
    'submit_club_join_request',
    'review_club_join_request'
  )
ORDER BY p.proname;
