-- Add tutorial_completado field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tutorial_completado boolean NOT NULL DEFAULT false;