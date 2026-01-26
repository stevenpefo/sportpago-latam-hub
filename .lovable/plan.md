

# Plan de Remediación de Seguridad - SportPago

## Resumen Ejecutivo

Este plan corrige **9 vulnerabilidades críticas** de exposición de datos causadas por políticas RLS (Row Level Security) demasiado permisivas. La corrección principal es reemplazar políticas públicas por políticas restrictivas que requieren autenticación.

---

## Fase 1: Crear Función Segura para Verificación de Código de Club

### Objetivo
Eliminar la política pública en `establecimientos` mientras se mantiene la funcionalidad de login de staff.

### Cambios en Base de Datos

**Migración SQL:**
```sql
-- 1. Crear función segura para verificar código de club (sin exponer datos)
CREATE OR REPLACE FUNCTION public.verify_club_code(_club_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.establecimientos
  WHERE codigo_club = upper(_club_code)
  LIMIT 1
$$;

-- 2. Crear función segura para verificar código de acceso de staff
CREATE OR REPLACE FUNCTION public.verify_staff_access(_establecimiento_id uuid, _codigo_acceso text)
RETURNS jsonb
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
```

---

## Fase 2: Corregir Políticas RLS

### 2.1 Tabla `establecimientos`
```sql
-- Eliminar política pública peligrosa
DROP POLICY IF EXISTS "Anyone can verify club code exists" ON public.establecimientos;

-- Solo usuarios autenticados con relación al establecimiento pueden ver
-- (Las políticas existentes 'Admins can view own establecimiento' ya cubren esto)
```

### 2.2 Tabla `staff_users`
```sql
-- Eliminar cualquier acceso público implícito
-- Las políticas existentes ya son correctas pero necesitan verificación
-- Solo admin del staff o el propio staff pueden ver
```

### 2.3 Tabla `profiles`
Las políticas existentes son correctas:
- `Users can view own profile` - USING: `auth.uid() = id`
- `Users can update own profile` - USING: `auth.uid() = id`

### 2.4 Tabla `user_roles`
La política existente es correcta:
- `Users can view own roles` - USING: `auth.uid() = user_id`

### 2.5 Tabla `athletes`
Las políticas existentes son correctas pero verificar que no haya acceso anónimo.

### 2.6 Tabla `transactions`
Las políticas existentes son correctas pero verificar que no haya acceso anónimo.

### 2.7 Tabla `audit_log`
La política existente es correcta:
- `Admins can view audit logs` - USING: `has_role(auth.uid(), 'admin')`

### 2.8 Tablas `payment_methods` y `staff_athlete_assignments`
Las políticas existentes parecen correctas, verificar acceso anónimo.

---

## Fase 3: Actualizar Código de Autenticación

### Archivo: `src/hooks/useAuth.tsx`

**Cambio en función `signInWithAccessCode`:**

```typescript
const signInWithAccessCode = async (clubCode: string, accessCode: string) => {
  // Usar función RPC segura en lugar de consulta directa
  const { data: estabId, error: estabError } = await supabase
    .rpc('verify_club_code', { _club_code: clubCode });

  if (estabError || !estabId) {
    return { error: 'invalidClubCode' };
  }

  // Usar función RPC segura para verificar staff
  const { data: staffData, error: staffError } = await supabase
    .rpc('verify_staff_access', { 
      _establecimiento_id: estabId, 
      _codigo_acceso: accessCode 
    });

  if (staffError || !staffData) {
    return { error: 'invalidPin' };
  }

  // Resto de la lógica permanece igual...
  if (staffData.user_id) {
    return { error: 'codeAlreadyLinked' };
  }

  sessionStorage.setItem('staff_session', JSON.stringify({
    staffId: staffData.id,
    nombre: staffData.nombre,
    establecimientoId: staffData.establecimiento_id,
  }));

  return { 
    error: null, 
    staffData,
    needsLinking: true,
  };
};
```

---

## Fase 4: Verificación de Storage Buckets

### Bucket `comprobantes` (privado)
- Verificar que solo usuarios autenticados del establecimiento puedan acceder
- Agregar políticas RLS para el bucket

### Bucket `logos` (público)
- Aceptable que sea público ya que son logos de establecimientos

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAuth.tsx` | Reemplazar consultas directas por llamadas RPC |

## Migraciones de Base de Datos

1. Crear funciones `verify_club_code` y `verify_staff_access`
2. Eliminar política `Anyone can verify club code exists`
3. Agregar políticas de storage para bucket `comprobantes`

---

## Detalles Técnicos

### Por qué las funciones SECURITY DEFINER son seguras

Las funciones con `SECURITY DEFINER`:
- Se ejecutan con los privilegios del propietario (superuser)
- Pueden acceder a tablas sin pasar por RLS
- Solo devuelven los datos específicos que programamos
- El usuario anónimo solo recibe el resultado, no acceso a la tabla

### Flujo de login de staff corregido

```text
Usuario ingresa código de club + PIN
         │
         ▼
┌────────────────────────────┐
│ supabase.rpc('verify_club_code') │
│ → Retorna solo el UUID o null    │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ supabase.rpc('verify_staff_access')     │
│ → Retorna solo datos necesarios         │
│   (id, nombre, establecimiento_id)      │
│ → NO expone codigo_acceso               │
└────────────────────────────────────┘
         │
         ▼
    Continúa flujo normal
```

---

## Prioridad de Implementación

1. **CRÍTICO** - Eliminar política pública de `establecimientos`
2. **CRÍTICO** - Crear funciones RPC seguras
3. **ALTO** - Actualizar `useAuth.tsx`
4. **MEDIO** - Verificar políticas de storage

## Tiempo Estimado
- Migraciones de BD: 5 minutos
- Cambios en código: 10 minutos
- Testing: 15 minutos

