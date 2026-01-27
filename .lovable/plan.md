

# Plan de Migración: SportPago a Supabase Externo

## Resumen Ejecutivo

Este plan te permitirá migrar SportPago a un nuevo proyecto Lovable **sin** Lovable Cloud, conectando tu propio proyecto de Supabase.com. Conservarás todo el código frontend y solo necesitarás configurar tu backend de Supabase.

---

## Paso 1: Crear tu Proyecto en Supabase.com

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (si no tienes una)
2. Crea un nuevo proyecto con estos datos:
   - **Nombre**: SportPago (o el que prefieras)
   - **Región**: Elige la más cercana a tus usuarios (ej: São Paulo para LATAM)
   - **Password**: Guárdala en un lugar seguro
3. Una vez creado, ve a **Settings → API** y copia:
   - `Project URL` (ej: `https://xxxxx.supabase.co`)
   - `anon public key` (la clave pública)

---

## Paso 2: Ejecutar las Migraciones SQL

Ve a **SQL Editor** en tu dashboard de Supabase y ejecuta el siguiente script completo:

```text
-- =============================================
-- SPORTPAGO - SCHEMA COMPLETO PARA SUPABASE
-- Ejecutar en SQL Editor de Supabase
-- =============================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
CREATE TYPE public.system_status AS ENUM ('al_dia', 'por_vencer', 'vencido');
CREATE TYPE public.manual_status AS ENUM ('pagado', 'pendiente', 'inactivo');
CREATE TYPE public.athlete_category AS ENUM ('principiante', 'intermedio', 'avanzado', 'profesional', 'infantil', 'juvenil', 'adulto');

-- 2. UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  telefono TEXT DEFAULT '',
  tutorial_completado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. USER ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. SECURITY DEFINER FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. ESTABLECIMIENTOS TABLE
CREATE TABLE public.establecimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  codigo_club TEXT NOT NULL UNIQUE,
  pais TEXT NOT NULL DEFAULT 'CO',
  moneda TEXT NOT NULL DEFAULT 'COP',
  simbolo_moneda TEXT NOT NULL DEFAULT '$',
  zona_horaria TEXT NOT NULL DEFAULT 'America/Bogota',
  logo_url TEXT,
  configuracion_completa BOOLEAN NOT NULL DEFAULT false,
  dias_aviso_vencimiento INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT codigo_club_format CHECK (codigo_club ~ '^[A-Z0-9]{4,6}$')
);

ALTER TABLE public.establecimientos ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_establecimientos_updated_at
  BEFORE UPDATE ON public.establecimientos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. PAYMENT METHODS TABLE
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

CREATE UNIQUE INDEX idx_staff_unique_code_per_estab 
  ON public.staff_users (establecimiento_id, codigo_acceso) 
  WHERE activo = true;

-- 10. STAFF ATHLETE ASSIGNMENTS
CREATE TABLE public.staff_athlete_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff_users(id) ON DELETE CASCADE NOT NULL,
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (staff_id, athlete_id)
);

ALTER TABLE public.staff_athlete_assignments ENABLE ROW LEVEL SECURITY;

-- 11. TRANSACTIONS TABLE
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
CREATE OR REPLACE FUNCTION public.get_user_establecimiento_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT id FROM public.establecimientos WHERE admin_id = _user_id LIMIT 1),
    (SELECT establecimiento_id FROM public.staff_users WHERE user_id = _user_id AND activo = true LIMIT 1)
  )
$$;

-- 14. RPC FUNCTIONS FOR STAFF LOGIN
CREATE OR REPLACE FUNCTION public.verify_club_code(_club_code TEXT)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.establecimientos 
  WHERE codigo_club = upper(_club_code)
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.verify_staff_access(_establecimiento_id UUID, _codigo_acceso TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.verify_club_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_club_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_staff_access(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_staff_access(UUID, TEXT) TO authenticated;

-- 15. HANDLE NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. RLS POLICIES (todas las políticas de seguridad)

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Establecimientos
CREATE POLICY "Admins can view own establecimiento" ON public.establecimientos FOR SELECT TO authenticated USING (admin_id = auth.uid() OR id = public.get_user_establecimiento_id(auth.uid()));
CREATE POLICY "Admins can insert establecimiento" ON public.establecimientos FOR INSERT TO authenticated WITH CHECK (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update own establecimiento" ON public.establecimientos FOR UPDATE TO authenticated USING (admin_id = auth.uid());

-- Payment methods
CREATE POLICY "Users can view payment methods of their establecimiento" ON public.payment_methods FOR SELECT TO authenticated USING (establecimiento_id = public.get_user_establecimiento_id(auth.uid()));
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.establecimientos WHERE id = establecimiento_id AND admin_id = auth.uid()));

-- Athletes
CREATE POLICY "Users can view athletes of their establecimiento" ON public.athletes FOR SELECT TO authenticated USING (establecimiento_id = public.get_user_establecimiento_id(auth.uid()));
CREATE POLICY "Admins can manage athletes" ON public.athletes FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.establecimientos WHERE id = establecimiento_id AND admin_id = auth.uid()));
CREATE POLICY "Staff can insert athletes if permitted" ON public.athletes FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.staff_users WHERE user_id = auth.uid() AND establecimiento_id = athletes.establecimiento_id AND puede_agregar_deportistas = true AND activo = true));

-- Staff users
CREATE POLICY "Admins can view their staff" ON public.staff_users FOR SELECT TO authenticated USING (admin_id = auth.uid() OR user_id = auth.uid());
CREATE POLICY "Admins can manage staff" ON public.staff_users FOR ALL TO authenticated USING (admin_id = auth.uid());

-- Staff assignments
CREATE POLICY "Users can view assignments" ON public.staff_athlete_assignments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_users WHERE id = staff_id AND (admin_id = auth.uid() OR user_id = auth.uid())));
CREATE POLICY "Admins can manage assignments" ON public.staff_athlete_assignments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_users s JOIN public.establecimientos e ON s.establecimiento_id = e.id WHERE s.id = staff_id AND e.admin_id = auth.uid()));

-- Transactions
CREATE POLICY "Users can view transactions of their establecimiento" ON public.transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.athletes a WHERE a.id = athlete_id AND a.establecimiento_id = public.get_user_establecimiento_id(auth.uid())));
CREATE POLICY "Users can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.athletes a WHERE a.id = athlete_id AND a.establecimiento_id = public.get_user_establecimiento_id(auth.uid())));
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.athletes a JOIN public.establecimientos e ON a.establecimiento_id = e.id WHERE a.id = athlete_id AND e.admin_id = auth.uid()));

-- Audit log
CREATE POLICY "Admins can view audit logs" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 17. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('comprobantes', 'comprobantes', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('logos', 'logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/svg+xml']);

-- Storage policies
CREATE POLICY "Users can view comprobantes of their establecimiento" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'comprobantes' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);
CREATE POLICY "Users can upload comprobantes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'comprobantes' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);
CREATE POLICY "Anyone can view logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'logos');
CREATE POLICY "Admins can upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);
CREATE POLICY "Admins can update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);
CREATE POLICY "Admins can delete logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = public.get_user_establecimiento_id(auth.uid())::text);
```

---

## Paso 3: Configurar Autenticación en Supabase

1. Ve a **Authentication → Settings**
2. En **Email Auth**:
   - Activa "Enable Email Signup"
   - **Desactiva "Confirm email"** (para pruebas rápidas)
3. En **URL Configuration**:
   - Site URL: `http://localhost:8080` (desarrollo) o tu dominio de producción

---

## Paso 4: Crear Nuevo Proyecto en Lovable

1. Ve a [lovable.dev](https://lovable.dev) y crea un **nuevo proyecto**
2. **IMPORTANTE**: Cuando te pregunte sobre backend, selecciona "No, I'll connect my own" o similar para NO activar Lovable Cloud
3. Una vez creado el proyecto vacío, conecta tu Supabase manualmente

---

## Paso 5: Migrar el Código Frontend

El código frontend está organizado así y necesita copiarse al nuevo proyecto:

| Directorio/Archivo | Descripción |
|-------------------|-------------|
| `src/pages/` | 11 páginas (Auth, Dashboard, Athletes, etc.) |
| `src/components/` | Todos los componentes UI y de negocio |
| `src/hooks/` | Hooks personalizados (useAuth, useAthletes, etc.) |
| `src/context/` | Contextos de React (Auth, Language, App) |
| `src/i18n/` | Traducciones (ES, EN, FR, PT) |
| `src/types/` | Definiciones de TypeScript |
| `src/utils/` | Utilidades (formateo, exportación, iconos) |
| `src/assets/` | Logo y recursos estáticos |
| `src/data/` | Datos estáticos (países) |
| `public/` | PWA assets, favicon, robots.txt |
| `capacitor.config.ts` | Config para app móvil |

**Archivos de configuración a copiar:**
- `tailwind.config.ts`
- `vite.config.ts` (tiene config de PWA)
- `components.json` (config de shadcn/ui)

---

## Paso 6: Configurar Variables de Entorno

En tu nuevo proyecto Lovable, crea un archivo `.env` con:

```text
VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
VITE_SUPABASE_PROJECT_ID=TU_PROJECT_ID
```

Reemplaza con los valores de tu proyecto Supabase.

---

## Paso 7: Verificar Tipos de Supabase

En tu nuevo proyecto, genera los tipos actualizados:

1. Instala Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Genera tipos: `supabase gen types typescript --project-id TU_PROJECT_ID > src/integrations/supabase/types.ts`

O copia el archivo `src/integrations/supabase/types.ts` del proyecto actual.

---

## Paso 8: Crear el Cliente de Supabase

Crea `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

---

## Archivos Completos del Proyecto

**Estructura del proyecto a migrar:**

```text
sportpago/
├── public/
│   ├── favicon.ico
│   ├── logo-sportpago.png
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   ├── pwa-maskable-512x512.png
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── logo-sportpago.png
│   │   └── logo-sportpago-optimized.webp
│   ├── components/
│   │   ├── athletes/ (6 archivos)
│   │   ├── dashboard/ (1 archivo)
│   │   ├── layout/ (4 archivos)
│   │   ├── onboarding/ (1 archivo)
│   │   ├── settings/ (1 archivo)
│   │   ├── staff/ (1 archivo)
│   │   ├── transactions/ (2 archivos)
│   │   ├── ui/ (40+ archivos shadcn)
│   │   └── NavLink.tsx
│   ├── context/
│   │   ├── AppContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── LanguageContext.tsx
│   ├── data/
│   │   └── countries.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAthletes.tsx
│   │   ├── useAuth.tsx
│   │   ├── useEstablecimiento.tsx
│   │   ├── useLanguage.ts
│   │   └── useTransactions.tsx (CORREGIR: hook no usado)
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/ (es, en, fr, pt .json)
│   ├── integrations/supabase/
│   │   ├── client.ts
│   │   └── types.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/ (11 archivos)
│   ├── types/
│   │   └── index.ts
│   ├── utils/ (4 archivos)
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── .env
├── capacitor.config.ts
├── components.json
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Resumen de Dependencias (package.json)

```json
{
  "dependencies": {
    "@capacitor/android": "^8.0.1",
    "@capacitor/cli": "^8.0.1",
    "@capacitor/core": "^8.0.1",
    "@capacitor/ios": "^8.0.1",
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-*": "(múltiples componentes)",
    "@supabase/supabase-js": "^2.89.0",
    "@tanstack/react-query": "^5.83.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.26.2",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "vite-plugin-pwa": "^1.2.0",
    "xlsx": "^0.18.5",
    "zod": "^3.25.76"
  }
}
```

---

## Checklist Final

- [ ] Proyecto Supabase creado en supabase.com
- [ ] Script SQL ejecutado en SQL Editor
- [ ] "Confirm email" desactivado en Auth settings
- [ ] Nuevo proyecto Lovable creado SIN Lovable Cloud
- [ ] Código frontend copiado al nuevo proyecto
- [ ] Variables de entorno configuradas
- [ ] Tipos de Supabase actualizados
- [ ] Probar registro y login
- [ ] Probar creación de establecimiento
- [ ] Probar CRUD de atletas

---

## Notas Importantes

1. **No elimines el proyecto actual** hasta verificar que todo funciona en el nuevo
2. Los datos actuales (1 perfil, 1 rol) no se migran automáticamente - son datos de prueba
3. Si tienes Edge Functions en el futuro, deberás desplegarlas manualmente con `supabase functions deploy`
4. El nuevo proyecto tendrá una URL diferente (no `sportpago-latam-hub.lovable.app`)

