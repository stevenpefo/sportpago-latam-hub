-- Add notification settings column to establecimientos table
ALTER TABLE public.establecimientos 
ADD COLUMN dias_aviso_vencimiento integer NOT NULL DEFAULT 1;

-- Add comment to explain the column
COMMENT ON COLUMN public.establecimientos.dias_aviso_vencimiento IS 'Days before payment due date to notify (0 = same day, 1 = 1 day before, etc.)';
