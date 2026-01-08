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