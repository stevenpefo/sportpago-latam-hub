-- SPORTPAGO USA — ONE-TIME BOOTSTRAP FOR A BRAND-NEW ISOLATED SUPABASE PROJECT.
-- Never run in the Colombia Lovable project.
-- Includes existing schema + club self-enrollment.
-- Guard rails: refuses to run when the app schema or any auth user exists.
-- All migration steps run in one transaction; on failure PostgreSQL rolls back.
BEGIN;
DO $staging_guard$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    RAISE EXCEPTION 'SAFETY STOP: this Supabase project already has authentication users. Create a brand-new USA staging project.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('profiles', 'user_roles', 'establecimientos', 'athletes', 'transactions', 'payment_methods', 'staff_users', 'athlete_join_requests', 'club_join_links')
  ) THEN
    RAISE EXCEPTION 'SAFETY STOP: SportPago tables already exist. Never run bootstrap in production or an initialized database.';
  END IF;
END;
$staging_guard$;


-- =========================================
-- Migration 1/8: 20260108201244_ed750039-06e6-43f7-9f6e-9ec16d731553.sql
-- =========================================
-- =============================================
-- SPORTPAGO DATABASE SCHEMA - COMPLETE
-- =============================================

-- 1. ENUM TYPES
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
CREATE TYPE public.system_status AS ENUM ('al_dia', 'por_vencer', 'vencido');
CREATE TYPE public.manual_status AS ENUM ('pagado', 'pendiente', 'inactivo');
CREATE TYPE public.athlete_category AS ENUM ('principiante', 'intermedio', 'avanzado', 'profesional', 'infantil', 'juvenil', 'adulto');

-- 2. UTILITY FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  telefono TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. USER ROLES TABLE (SEPARATE FOR SECURITY)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. SECURITY DEFINER FUNCTION FOR ROLE CHECK
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. ESTABLECIMIENTOS TABLE
-- =============================================
CREATE TABLE public.establecimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  pais TEXT NOT NULL DEFAULT 'CO',
  moneda TEXT NOT NULL DEFAULT 'COP',
  simbolo_moneda TEXT NOT NULL DEFAULT '$',
  zona_horaria TEXT NOT NULL DEFAULT 'America/Bogota',
  logo_url TEXT,
  configuracion_completa BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.establecimientos ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_establecimientos_updated_at
  BEFORE UPDATE ON public.establecimientos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. PAYMENT METHODS TABLE
-- =============================================
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id UUID REFERENCES public.establecimientos(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT 'Banknote',
  activo BOOLEAN NOT NULL DEFAULT true,
  es_personalizado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- 8. ATHLETES TABLE
-- =============================================
CREATE TABLE public.athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id UUID REFERENCES public.establecimientos(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  identificacion TEXT,
  deporte TEXT NOT NULL,
  deporte_personalizado TEXT,
  fecha_nacimiento DATE,
  categoria athlete_category,
  telefono TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  monto_mensual DECIMAL(12,2) NOT NULL DEFAULT 0,
  dia_pago INTEGER NOT NULL DEFAULT 1 CHECK (dia_pago >= 1 AND dia_pago <= 31),
  ultimo_pago TIMESTAMPTZ,
  proximo_pago TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado_sistema system_status NOT NULL DEFAULT 'al_dia',
  estado_manual manual_status NOT NULL DEFAULT 'pendiente',
  avatar_url TEXT,
  referido_por TEXT,
  validado BOOLEAN NOT NULL DEFAULT true,
  agregado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_athletes_updated_at
  BEFORE UPDATE ON public.athletes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. STAFF USERS TABLE
-- =============================================
CREATE TABLE public.staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id UUID REFERENCES public.establecimientos(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  codigo_acceso TEXT NOT NULL,
  permisos TEXT[] NOT NULL DEFAULT '{}',
  puede_agregar_deportistas BOOLEAN NOT NULL DEFAULT false,
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_invitacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_staff_users_updated_at
  BEFORE UPDATE ON public.staff_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. STAFF ATHLETE ASSIGNMENTS
-- =============================================
CREATE TABLE public.staff_athlete_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff_users(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (staff_id, athlete_id)
);

ALTER TABLE public.staff_athlete_assignments ENABLE ROW LEVEL SECURITY;

-- 11. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  monto DECIMAL(12,2) NOT NULL,
  monto_personalizado DECIMAL(12,2),
  meses_pagados INTEGER NOT NULL DEFAULT 1 CHECK (meses_pagados >= 1 AND meses_pagados <= 12),
  metodo_pago TEXT NOT NULL,
  registrado_por UUID REFERENCES auth.users(id),
  registrado_por_nombre TEXT NOT NULL DEFAULT '',
  referencia TEXT,
  moneda TEXT NOT NULL DEFAULT 'COP',
  observaciones TEXT,
  comprobante_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 12. AUDIT LOG TABLE
-- =============================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 13. HELPER FUNCTION: GET USER ESTABLECIMIENTO
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_establecimiento_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT id FROM public.establecimientos WHERE admin_id = _user_id LIMIT 1),
    (SELECT establecimiento_id FROM public.staff_users WHERE user_id = _user_id AND activo = true LIMIT 1)
  )
$$;

-- 14. HANDLE NEW USER TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, nombre)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', ''));
  
  -- Assign admin role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Establecimientos policies
CREATE POLICY "Admins can view own establecimiento"
  ON public.establecimientos FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid() OR id = public.get_user_establecimiento_id(auth.uid()));

CREATE POLICY "Admins can insert establecimiento"
  ON public.establecimientos FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update own establecimiento"
  ON public.establecimientos FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid());

-- Payment methods policies
CREATE POLICY "Users can view payment methods of their establecimiento"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (establecimiento_id = public.get_user_establecimiento_id(auth.uid()));

CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.establecimientos 
      WHERE id = establecimiento_id AND admin_id = auth.uid()
    )
  );

-- Athletes policies
CREATE POLICY "Users can view athletes of their establecimiento"
  ON public.athletes FOR SELECT
  TO authenticated
  USING (establecimiento_id = public.get_user_establecimiento_id(auth.uid()));

CREATE POLICY "Admins can manage athletes"
  ON public.athletes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.establecimientos 
      WHERE id = establecimiento_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Staff can insert athletes if permitted"
  ON public.athletes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE user_id = auth.uid() 
        AND establecimiento_id = athletes.establecimiento_id
        AND puede_agregar_deportistas = true
        AND activo = true
    )
  );

-- Staff users policies
CREATE POLICY "Admins can view their staff"
  ON public.staff_users FOR SELECT
  TO authenticated
  USING (admin_id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "Admins can manage staff"
  ON public.staff_users FOR ALL
  TO authenticated
  USING (admin_id = auth.uid());

-- Staff athlete assignments policies
CREATE POLICY "Users can view assignments"
  ON public.staff_athlete_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users 
      WHERE id = staff_id AND (admin_id = auth.uid() OR user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage assignments"
  ON public.staff_athlete_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_users s
      JOIN public.establecimientos e ON s.establecimiento_id = e.id
      WHERE s.id = staff_id AND e.admin_id = auth.uid()
    )
  );

-- Transactions policies
CREATE POLICY "Users can view transactions of their establecimiento"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.athletes a
      WHERE a.id = athlete_id 
        AND a.establecimiento_id = public.get_user_establecimiento_id(auth.uid())
    )
  );

CREATE POLICY "Users can insert transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.athletes a
      WHERE a.id = athlete_id 
        AND a.establecimiento_id = public.get_user_establecimiento_id(auth.uid())
    )
  );

CREATE POLICY "Admins can manage transactions"
  ON public.transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.athletes a
      JOIN public.establecimientos e ON a.establecimiento_id = e.id
      WHERE a.id = athlete_id AND e.admin_id = auth.uid()
    )
  );

-- Audit log policies
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 16. STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('comprobantes', 'comprobantes', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('logos', 'logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/svg+xml']);

-- Storage policies for comprobantes
CREATE POLICY "Users can view comprobantes of their establecimiento"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'comprobantes' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);

CREATE POLICY "Users can upload comprobantes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'comprobantes' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);

-- Storage policies for logos
CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);

CREATE POLICY "Admins can update logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);

CREATE POLICY "Admins can delete logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);


-- =========================================
-- Migration 2/8: 20260108201435_f13c2dcd-d4bc-4803-adaf-dafe2505fb7d.sql
-- =========================================
-- Fix audit_log INSERT policy to be more restrictive
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());


-- =========================================
-- Migration 3/8: 20260115032412_bafc6c20-d391-4d6d-932f-0dd04885c17f.sql
-- =========================================
-- Add tutorial_completado field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tutorial_completado boolean NOT NULL DEFAULT false;


-- =========================================
-- Migration 4/8: 20260123035241_654cc2e1-ef4b-4721-a5f4-f6f560f5b12c.sql
-- =========================================
-- Add codigo_club column to establecimientos
ALTER TABLE public.establecimientos 
ADD COLUMN codigo_club TEXT;

-- Generate unique codes for existing establishments
UPDATE public.establecimientos 
SET codigo_club = UPPER(SUBSTRING(MD5(id::text), 1, 6))
WHERE codigo_club IS NULL;

-- Make the column NOT NULL and UNIQUE after populating
ALTER TABLE public.establecimientos 
ALTER COLUMN codigo_club SET NOT NULL;

ALTER TABLE public.establecimientos 
ADD CONSTRAINT establecimientos_codigo_club_unique UNIQUE (codigo_club);

-- Add check constraint for code format (4-6 alphanumeric characters)
ALTER TABLE public.establecimientos 
ADD CONSTRAINT codigo_club_format 
CHECK (codigo_club ~ '^[A-Z0-9]{4,6}$');

-- Create unique index for staff code per establishment (only active staff)
CREATE UNIQUE INDEX idx_staff_unique_code_per_estab 
ON public.staff_users (establecimiento_id, codigo_acceso) 
WHERE activo = true;

-- Add RLS policy for viewing codigo_club (staff need to verify club code exists)
CREATE POLICY "Anyone can verify club code exists" 
ON public.establecimientos 
FOR SELECT 
USING (true);


-- =========================================
-- Migration 5/8: 20260124010913_b4b01e6e-3095-4f8d-9e18-2299b6a13aa2.sql
-- =========================================
-- Add notification settings column to establecimientos table
ALTER TABLE public.establecimientos 
ADD COLUMN dias_aviso_vencimiento integer NOT NULL DEFAULT 1;

-- Add comment to explain the column
COMMENT ON COLUMN public.establecimientos.dias_aviso_vencimiento IS 'Days before payment due date to notify (0 = same day, 1 = 1 day before, etc.)';



-- =========================================
-- Migration 6/8: 20260126025926_9c811a4c-5a8b-4fe1-931d-4977048bcd98.sql
-- =========================================
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


-- =========================================
-- Migration 7/8: 20260126030409_8a57277e-3c4f-4f02-9e8d-6349449f6c21.sql
-- =========================================
-- Drop the public policy that exposes establecimientos data
DROP POLICY IF EXISTS "Anyone can verify club code exists" ON public.establecimientos;


-- =========================================
-- Migration 8/8: 20261028120000_club_self_enrollment.sql
-- =========================================
-- SportPago: club-specific self-enrollment, staged only.
-- IMPORTANT: Apply ONLY to an isolated Supabase staging project after review.
-- Existing athletes, transactions, payment logic and Colombian production are untouched.

CREATE TABLE public.club_join_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id uuid NOT NULL UNIQUE REFERENCES public.establecimientos(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT (
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  ),
  activo boolean NOT NULL DEFAULT true,
  creado_por uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.club_join_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.club_join_links FROM anon, authenticated;
GRANT SELECT ON TABLE public.club_join_links TO authenticated;

CREATE POLICY "Club admins can read their join link"
ON public.club_join_links FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.establecimientos e
    WHERE e.id = club_join_links.establecimiento_id AND e.admin_id = (SELECT auth.uid())
  )
);

CREATE TABLE public.athlete_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establecimiento_id uuid NOT NULL REFERENCES public.establecimientos(id) ON DELETE CASCADE,
  link_id uuid NOT NULL REFERENCES public.club_join_links(id) ON DELETE CASCADE,
  nombre text NOT NULL CHECK (length(btrim(nombre)) BETWEEN 2 AND 120),
  deporte text NOT NULL CHECK (length(btrim(deporte)) BETWEEN 2 AND 80),
  contacto_nombre text NOT NULL CHECK (length(btrim(contacto_nombre)) BETWEEN 2 AND 120),
  contacto_email text NOT NULL CHECK (length(btrim(contacto_email)) BETWEEN 5 AND 254),
  contacto_telefono text NOT NULL DEFAULT '' CHECK (length(contacto_telefono) <= 32),
  es_acudiente boolean NOT NULL DEFAULT false,
  acepta_privacidad boolean NOT NULL CHECK (acepta_privacidad = true),
  estado text NOT NULL DEFAULT 'pending' CHECK (estado IN ('pending', 'approved', 'rejected')),
  athlete_id uuid REFERENCES public.athletes(id) ON DELETE SET NULL,
  revisado_por uuid REFERENCES auth.users(id),
  revisado_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.athlete_join_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.athlete_join_requests FROM anon, authenticated;
GRANT SELECT ON TABLE public.athlete_join_requests TO authenticated;

CREATE INDEX athlete_join_requests_club_status_idx
ON public.athlete_join_requests (establecimiento_id, estado, created_at DESC);
CREATE INDEX athlete_join_requests_link_recent_idx
ON public.athlete_join_requests (link_id, created_at DESC);
CREATE UNIQUE INDEX athlete_join_requests_one_pending_per_person_idx
ON public.athlete_join_requests (
  establecimiento_id,
  lower(btrim(nombre)),
  lower(btrim(contacto_email))
)
WHERE estado = 'pending';

CREATE POLICY "Club admins can read signup requests"
ON public.athlete_join_requests FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.establecimientos e
    WHERE e.id = athlete_join_requests.establecimiento_id AND e.admin_id = (SELECT auth.uid())
  )
);

-- Generate once; do not regenerate links on every page load.
CREATE OR REPLACE FUNCTION public.ensure_club_join_link(p_club_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_token text;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.establecimientos e
    WHERE e.id = p_club_id AND e.admin_id = (SELECT auth.uid())
  ) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501'; END IF;

  INSERT INTO public.club_join_links (establecimiento_id, creado_por)
  VALUES (p_club_id, (SELECT auth.uid()))
  ON CONFLICT (establecimiento_id) DO NOTHING;

  SELECT token INTO v_token FROM public.club_join_links
  WHERE establecimiento_id = p_club_id AND activo;
  IF v_token IS NULL THEN
    RAISE EXCEPTION 'Invitation is disabled' USING ERRCODE = '22023';
  END IF;
  RETURN v_token;
END; $$;

-- Rotating invalidates the old shared link, with no change to existing athletes.
CREATE OR REPLACE FUNCTION public.rotate_club_join_link(p_club_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_token text;
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.establecimientos e
    WHERE e.id = p_club_id AND e.admin_id = (SELECT auth.uid())
  ) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501'; END IF;

  UPDATE public.club_join_links SET
    token = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
    activo = true
  WHERE establecimiento_id = p_club_id RETURNING token INTO v_token;

  IF v_token IS NULL THEN
    RETURN public.ensure_club_join_link(p_club_id);
  END IF;
  RETURN v_token;
END; $$;

-- Anonymous users see only the club name associated with a strong invitation token.
CREATE OR REPLACE FUNCTION public.get_club_join_info(p_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_info jsonb;
BEGIN
  IF p_token !~ '^[0-9a-f]{64}$' THEN RETURN NULL; END IF;
  SELECT jsonb_build_object('club_name', e.nombre)
  INTO v_info
  FROM public.club_join_links l
  JOIN public.establecimientos e ON e.id = l.establecimiento_id
  WHERE l.token = p_token AND l.activo = true;
  RETURN v_info;
END; $$;

-- Anonymous submissions are isolated as requests; they NEVER write directly to athletes.
CREATE OR REPLACE FUNCTION public.submit_club_join_request(
  p_token text, p_nombre text, p_deporte text, p_contacto_nombre text,
  p_contacto_email text, p_contacto_telefono text,
  p_es_acudiente boolean, p_acepta_privacidad boolean
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_link public.club_join_links%ROWTYPE; v_id uuid; v_email text;
BEGIN
  IF p_acepta_privacidad IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Privacy agreement is required' USING ERRCODE = '22023';
  END IF;
  IF length(btrim(coalesce(p_nombre, ''))) NOT BETWEEN 2 AND 120
    OR length(btrim(coalesce(p_deporte, ''))) NOT BETWEEN 2 AND 80
    OR length(btrim(coalesce(p_contacto_nombre, ''))) NOT BETWEEN 2 AND 120
    OR length(coalesce(p_contacto_telefono, '')) > 32
    OR p_contacto_email IS NULL
  THEN RAISE EXCEPTION 'Invalid registration information' USING ERRCODE = '22023'; END IF;

  v_email := lower(btrim(p_contacto_email));
  IF length(v_email) NOT BETWEEN 5 AND 254
    OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  THEN RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023'; END IF;

  SELECT * INTO v_link FROM public.club_join_links
  WHERE token = p_token AND activo = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not available' USING ERRCODE = '22023'; END IF;

  -- Basic abuse controls. A CAPTCHA / edge rate limit is required before public US launch.
  IF (SELECT count(*) FROM public.athlete_join_requests
      WHERE link_id = v_link.id AND created_at > now() - interval '10 minutes') >= 100 THEN
    RAISE EXCEPTION 'Too many requests. Try again later' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(*) FROM public.athlete_join_requests
      WHERE establecimiento_id = v_link.establecimiento_id
        AND contacto_email = v_email AND created_at > now() - interval '1 hour') >= 3 THEN
    RAISE EXCEPTION 'Too many registrations for this contact' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.athlete_join_requests (
    establecimiento_id, link_id, nombre, deporte, contacto_nombre,
    contacto_email, contacto_telefono, es_acudiente, acepta_privacidad
  )
  VALUES (
    v_link.establecimiento_id, v_link.id, btrim(p_nombre), btrim(p_deporte),
    btrim(p_contacto_nombre), v_email, btrim(coalesce(p_contacto_telefono, '')),
    coalesce(p_es_acudiente, false), true
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

-- Coach-only atomic review; prevents auto-inserting unwanted/duplicate athletes.
CREATE OR REPLACE FUNCTION public.review_club_join_request(
  p_request_id uuid, p_approve boolean, p_amount numeric DEFAULT 0, p_payment_day int DEFAULT 1
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_request public.athlete_join_requests%ROWTYPE; v_athlete_id uuid;
BEGIN
  SELECT * INTO v_request FROM public.athlete_join_requests
  WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found' USING ERRCODE = '22023'; END IF;

  IF (SELECT auth.uid()) IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.establecimientos e
    WHERE e.id = v_request.establecimiento_id AND e.admin_id = (SELECT auth.uid())
  ) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501'; END IF;

  IF v_request.estado <> 'pending' THEN
    RAISE EXCEPTION 'Request already reviewed' USING ERRCODE = '22023';
  END IF;

  IF p_approve THEN
    IF p_amount IS NULL OR p_amount < 0 OR p_amount > 999999999
      OR p_payment_day NOT BETWEEN 1 AND 28 THEN
      RAISE EXCEPTION 'Invalid payment configuration' USING ERRCODE = '22023';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.athletes a
      WHERE a.establecimiento_id = v_request.establecimiento_id
        AND lower(btrim(a.nombre)) = lower(btrim(v_request.nombre))
        AND lower(btrim(a.email)) = v_request.contacto_email
    ) THEN RAISE EXCEPTION 'Possible duplicate athlete; review manually' USING ERRCODE = '23505'; END IF;

    INSERT INTO public.athletes (
      establecimiento_id, nombre, deporte, telefono, email, monto_mensual,
      dia_pago, estado_manual, validado, agregado_por
    ) VALUES (
      v_request.establecimiento_id, v_request.nombre, v_request.deporte,
      v_request.contacto_telefono, v_request.contacto_email,
      p_amount, p_payment_day, 'pendiente', true, (SELECT auth.uid())
    ) RETURNING id INTO v_athlete_id;
  END IF;

  UPDATE public.athlete_join_requests SET
    estado = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
    athlete_id = v_athlete_id, revisado_por = (SELECT auth.uid()),
    revisado_at = now()
  WHERE id = p_request_id;
  RETURN v_athlete_id;
END; $$;

REVOKE ALL ON FUNCTION public.ensure_club_join_link(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_club_join_link(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.rotate_club_join_link(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_club_join_link(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_club_join_info(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_club_join_info(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_club_join_request(text,text,text,text,text,text,boolean,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_club_join_request(text,text,text,text,text,text,boolean,boolean) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.review_club_join_request(uuid,boolean,numeric,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_club_join_request(uuid,boolean,numeric,integer) TO authenticated;


-- The application must still be connected to the NEW staging project.
-- This script does not create any actual clubs or users.
COMMIT;
