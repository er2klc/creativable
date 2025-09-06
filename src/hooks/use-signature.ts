import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SignatureData } from "@/types/signature";

export const useSignature = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['signature-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_signatures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching signature:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Deine Signatur konnte nicht geladen werden.",
          variant: "destructive",
        });
        return null;
      }

      return data;
    },
  });
};