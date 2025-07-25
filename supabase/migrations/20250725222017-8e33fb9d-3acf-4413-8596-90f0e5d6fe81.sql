-- Check and add missing foreign key constraints for elevate tables

-- Add foreign key for elevate_modules -> elevate_platforms
ALTER TABLE public.elevate_modules 
ADD CONSTRAINT IF NOT EXISTS elevate_modules_platform_id_fkey 
FOREIGN KEY (platform_id) REFERENCES public.elevate_platforms(id) ON DELETE CASCADE;

-- Add foreign key for elevate_lerninhalte -> elevate_modules  
ALTER TABLE public.elevate_lerninhalte
ADD CONSTRAINT IF NOT EXISTS elevate_lerninhalte_module_id_fkey
FOREIGN KEY (module_id) REFERENCES public.elevate_modules(id) ON DELETE CASCADE;

-- Check if the pipeline exists that's causing the 406 error
-- Create a default pipeline if none exists for this user
INSERT INTO public.pipelines (user_id, name, order_index)
SELECT '7d0fca51-1028-4c33-9558-88d8ec2b8d8a', 'Standard Pipeline', 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.pipelines 
  WHERE user_id = '7d0fca51-1028-4c33-9558-88d8ec2b8d8a'
);