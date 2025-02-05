
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useElevateProgress = () => {
  const user = useUser();

  return useQuery({
    queryKey: ['elevate-total-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Get all platforms the user has access to
      const { data: platforms } = await supabase
        .from('elevate_platforms')
        .select(`
          id,
          elevate_modules!elevate_modules_platform_id_fkey (
            id,
            elevate_lerninhalte!elevate_lerninhalte_module_id_fkey (
              id
            )
          )
        `);

      if (!platforms) return 0;

      // Flatten all lerninhalte IDs
      const lerninhalteIds = platforms.flatMap(platform => 
        platform.elevate_modules?.flatMap(module => 
          module.elevate_lerninhalte?.map(item => item.id)
        ) || []
      );

      if (lerninhalteIds.length === 0) return 0;

      // Get completed lerninhalte count
      const { data: completedLerninhalte } = await supabase
        .from('elevate_user_progress')
        .select('lerninhalte_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('lerninhalte_id', lerninhalteIds);

      // Calculate total progress
      const totalUnits = lerninhalteIds.length;
      const completedUnits = completedLerninhalte?.length || 0;
      return totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
    },
    enabled: !!user?.id,
  });
};
