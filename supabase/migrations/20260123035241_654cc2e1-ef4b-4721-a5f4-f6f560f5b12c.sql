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