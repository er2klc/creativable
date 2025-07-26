-- Add missing foreign key constraints for elevate tables (correct syntax)

-- Check if constraint exists before adding for elevate_modules
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'elevate_modules_platform_id_fkey' 
        AND table_name = 'elevate_modules'
    ) THEN
        ALTER TABLE public.elevate_modules 
        ADD CONSTRAINT elevate_modules_platform_id_fkey 
        FOREIGN KEY (platform_id) REFERENCES public.elevate_platforms(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if constraint exists before adding for elevate_lerninhalte
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'elevate_lerninhalte_module_id_fkey' 
        AND table_name = 'elevate_lerninhalte'
    ) THEN
        ALTER TABLE public.elevate_lerninhalte
        ADD CONSTRAINT elevate_lerninhalte_module_id_fkey
        FOREIGN KEY (module_id) REFERENCES public.elevate_modules(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create a default pipeline if none exists for this user
INSERT INTO public.pipelines (user_id, name, order_index)
SELECT '7d0fca51-1028-4c33-9558-88d8ec2b8d8a', 'Standard Pipeline', 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.pipelines 
  WHERE user_id = '7d0fca51-1028-4c33-9558-88d8ec2b8d8a'
);