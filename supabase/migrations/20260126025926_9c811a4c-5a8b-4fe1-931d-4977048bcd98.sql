-- Create secure RPC function to verify club code (no direct table access needed)
CREATE OR REPLACE FUNCTION public.verify_club_code(_club_code TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.establecimientos 
  WHERE codigo_club = upper(_club_code)
  LIMIT 1
$$;

-- Create secure RPC function to verify staff access code
CREATE OR REPLACE FUNCTION public.verify_staff_access(
  _establecimiento_id UUID,
  _codigo_acceso TEXT
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', id,
    'nombre', nombre,
    'user_id', user_id,
    'establecimiento_id', establecimiento_id,
    'activo', activo
  )
  FROM public.staff_users
  WHERE establecimiento_id = _establecimiento_id
    AND codigo_acceso = _codigo_acceso
    AND activo = true
  LIMIT 1
$$;

-- Grant execute permissions to both authenticated and anon (needed for login flow before auth)
GRANT EXECUTE ON FUNCTION public.verify_club_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_club_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_staff_access(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_staff_access(UUID, TEXT) TO authenticated;