-- SPORTPAGO INTERNACIONAL: PRUEBAS SQL DE CONTRATO (SOLO LECTURA)
-- Proyecto verificado desde Lovable: myqrrmtubfqlnnqdoams
-- Ejecución segura en SQL Editor del Supabase EXISTENTE.
-- No crea, modifica, borra registros ni ejecuta la aprobación.
-- Un resultado FAIL implica detener la publicación y revisar permisos.

WITH checks AS (
  SELECT '01 Clubes existentes y RLS' AS prueba,
         COALESCE((SELECT relrowsecurity FROM pg_catalog.pg_class
                   WHERE oid=to_regclass('public.establecimientos')), false) AS cumple
  UNION ALL
  SELECT '02 Deportistas existentes y RLS',
         COALESCE((SELECT relrowsecurity FROM pg_catalog.pg_class
                   WHERE oid=to_regclass('public.athletes')), false)
  UNION ALL
  SELECT '03 Enlaces de club: tabla + RLS',
         COALESCE((SELECT relrowsecurity FROM pg_catalog.pg_class
                   WHERE oid=to_regclass('public.club_join_links')), false)
  UNION ALL
  SELECT '04 Solicitudes: tabla + RLS',
         COALESCE((SELECT relrowsecurity FROM pg_catalog.pg_class
                   WHERE oid=to_regclass('public.athlete_join_requests')), false)
  UNION ALL
  SELECT '05 Enlaces: lectura anon bloqueada',
         NOT COALESCE((SELECT has_table_privilege('anon',oid,'SELECT')
                       FROM pg_catalog.pg_class WHERE oid=to_regclass('public.club_join_links')), true)
  UNION ALL
  SELECT '06 Solicitudes: lectura anon bloqueada',
         NOT COALESCE((SELECT has_table_privilege('anon',oid,'SELECT')
                       FROM pg_catalog.pg_class WHERE oid=to_regclass('public.athlete_join_requests')), true)
  UNION ALL
  SELECT '07 Solicitudes: escritura directa anon bloqueada',
         NOT COALESCE((SELECT has_table_privilege('anon',oid,'INSERT')
                       FROM pg_catalog.pg_class WHERE oid=to_regclass('public.athlete_join_requests')), true)
  UNION ALL
  SELECT '08 Funciones de autoinscripción: 5 existentes',
         (SELECT count(DISTINCT proname)=5 FROM pg_catalog.pg_proc p
          JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
          WHERE n.nspname='public' AND proname IN
          ('ensure_club_join_link','rotate_club_join_link','get_club_join_info',
           'submit_club_join_request','review_club_join_request'))
  UNION ALL
  SELECT '09 Todas las funciones nuevas usan SECURITY DEFINER',
         (SELECT count(DISTINCT proname)=5 AND bool_and(prosecdef)
          FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
          WHERE n.nspname='public' AND proname IN
          ('ensure_club_join_link','rotate_club_join_link','get_club_join_info',
           'submit_club_join_request','review_club_join_request'))
  UNION ALL
  SELECT '10 Funciones nuevas: search_path fijado',
         (SELECT count(DISTINCT proname)=5
                 AND bool_and('search_path=' = ANY(COALESCE(proconfig,ARRAY[]::text[])))
          FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
          WHERE n.nspname='public' AND proname IN
          ('ensure_club_join_link','rotate_club_join_link','get_club_join_info',
           'submit_club_join_request','review_club_join_request'))
  UNION ALL
  SELECT '11 Anon puede consultar club solo por RPC',
         COALESCE(has_function_privilege('anon',
           to_regprocedure('public.get_club_join_info(text)'), 'EXECUTE'), false)
  UNION ALL
  SELECT '12 Anon puede enviar solicitud solo por RPC',
         COALESCE(has_function_privilege('anon',
           to_regprocedure('public.submit_club_join_request(text,text,text,text,text,text,boolean,boolean)'), 'EXECUTE'), false)
  UNION ALL
  SELECT '13 Anon NO puede crear enlace',
         NOT COALESCE(has_function_privilege('anon',
           to_regprocedure('public.ensure_club_join_link(uuid)'), 'EXECUTE'), true)
  UNION ALL
  SELECT '14 Anon NO puede renovar enlace',
         NOT COALESCE(has_function_privilege('anon',
           to_regprocedure('public.rotate_club_join_link(uuid)'), 'EXECUTE'), true)
  UNION ALL
  SELECT '15 Anon NO puede aprobar/rechazar',
         NOT COALESCE(has_function_privilege('anon',
           to_regprocedure('public.review_club_join_request(uuid,boolean,numeric,integer)'), 'EXECUTE'), true)
  UNION ALL
  SELECT '16 RLS SELECT clubes aplicado a enlaces',
         EXISTS(SELECT 1 FROM pg_catalog.pg_policies WHERE schemaname='public'
           AND tablename='club_join_links' AND cmd='SELECT'
           AND policyname='Club admins can read their join link')
  UNION ALL
  SELECT '17 RLS SELECT clubes aplicado a solicitudes',
         EXISTS(SELECT 1 FROM pg_catalog.pg_policies WHERE schemaname='public'
           AND tablename='athlete_join_requests' AND cmd='SELECT'
           AND policyname='Club admins can read signup requests')
  UNION ALL
  SELECT '18 No hay solicitudes huérfanas por club',
         NOT EXISTS(
           SELECT 1 FROM public.athlete_join_requests r
           LEFT JOIN public.establecimientos e ON e.id=r.establecimiento_id
           WHERE e.id IS NULL)
  UNION ALL
  SELECT '19 No hay enlaces huérfanos por club',
         NOT EXISTS(
           SELECT 1 FROM public.club_join_links l
           LEFT JOIN public.establecimientos e ON e.id=l.establecimiento_id
           WHERE e.id IS NULL)
  UNION ALL
  SELECT '20 Los enlaces usan token único',
         EXISTS(
           SELECT 1 FROM pg_indexes WHERE schemaname='public'
           AND tablename='club_join_links' AND indexdef ILIKE '%UNIQUE%'
           AND indexdef ILIKE '%(token)%')
)
SELECT prueba,
       CASE WHEN cumple THEN 'PASS' ELSE 'FAIL' END AS resultado
FROM checks
ORDER BY prueba;

-- No se imprimen nombres, emails, teléfonos ni tokens.
