-- Drop the public policy that exposes establecimientos data
DROP POLICY IF EXISTS "Anyone can verify club code exists" ON public.establecimientos;