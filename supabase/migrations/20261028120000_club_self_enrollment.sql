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
