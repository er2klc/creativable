
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadWithRelations } from "@/types/leads";

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const useLeadData = (leadId: string | null) => {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) {
        throw new Error("No lead ID provided");
      }

      if (!isValidUUID(leadId)) {
        throw new Error("Invalid lead ID format");
      }

      console.log("Fetching lead data for ID:", leadId);
      
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          messages (*),
          tasks (id, title, lead_id, user_id, priority, completed, created_at, updated_at, due_date, order_index, cancelled, color, meeting_type),
          notes (*),
          lead_files (*),
          social_media_posts (*)
        `)
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      console.log("Lead data fetched successfully:", {
        id: data.id,
        notesCount: data.notes?.length || 0,
        messagesCount: data.messages?.length || 0,
        tasksCount: data.tasks?.length || 0,
        taskCompleted: data.tasks?.map(t => t.completed)
      });

      return data as LeadWithRelations;
    },
    enabled: !!leadId && isValidUUID(leadId),
    staleTime: 0, // Immer neu laden
    cacheTime: 5 * 60 * 1000, // 5 Minuten im Cache behalten
  });
};
