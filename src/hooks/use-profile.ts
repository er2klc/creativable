
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/integrations/supabase/types/profiles";

export const useProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return null;

        console.log("Fetching profile for user:", user.id);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            id,
            is_admin,
            created_at,
            updated_at,
            email,
            display_name,
            is_super_admin,
            avatar_url
          `)
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          return null;
        }

        // Entferne nicht-serialisierbare Eigenschaften
        const sanitizedProfile = {
          ...profile,
          __proto__: undefined
        };

        return sanitizedProfile as Profile;
      } catch (error) {
        console.error("Error in useProfile:", error);
        return null;
      }
    },
  });
};
