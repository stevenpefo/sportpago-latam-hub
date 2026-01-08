-- Fix audit_log INSERT policy to be more restrictive
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());