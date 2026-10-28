-- SPORTPAGO USA — READ-ONLY VERIFICATION, run ONLY after bootstrap.
-- No inserts, updates, deletes, or schema changes.
SELECT
  current_database() AS database_name,
  to_regclass('public.establecimientos') IS NOT NULL AS clubs_table_exists,
  to_regclass('public.athletes') IS NOT NULL AS athletes_table_exists,
  to_regclass('public.club_join_links') IS NOT NULL AS club_links_table_exists,
  to_regclass('public.athlete_join_requests') IS NOT NULL AS join_requests_table_exists,
  to_regprocedure('public.submit_club_join_request(text,text,text,text,text,text,boolean,boolean)') IS NOT NULL AS enrollment_rpc_exists,
  to_regprocedure('public.review_club_join_request(uuid,boolean,numeric,integer)') IS NOT NULL AS approval_rpc_exists;

SELECT
  (SELECT count(*) FROM auth.users) AS test_users,
  (SELECT count(*) FROM public.establecimientos) AS test_clubs,
  (SELECT count(*) FROM public.athletes) AS test_athletes,
  (SELECT count(*) FROM public.athlete_join_requests) AS test_join_requests;

SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('athletes','establecimientos','athlete_join_requests','club_join_links')
ORDER BY tablename;
