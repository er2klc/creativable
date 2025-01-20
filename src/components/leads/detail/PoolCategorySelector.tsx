import { Archive, Clock, User, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface PoolCategorySelectorProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export const PoolCategorySelector = ({ lead, onUpdateLead }: PoolCategorySelectorProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const updatePoolCategoryMutation = useMutation({
    mutationFn: async (category: string | null) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ 
          pool_category: category,
          onboarding_progress: category === 'partner' ? {
            message_sent: false,
            team_invited: false,
            training_provided: false,
            intro_meeting_scheduled: false
          } : null
        })
        .eq("id", lead.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      const categoryLabels: Record<string, string> = {
        partner: "Partner",
        kunde: "Kunde",
        not_for_now: "Später kontaktieren",
        kein_interesse: "Kein Interesse"
      };
      toast.success(
        settings?.language === "en"
          ? `Contact moved to ${categoryLabels[data.pool_category || ""]}`
          : `Kontakt wurde zu ${categoryLabels[data.pool_category || ""]} verschoben`
      );
    },
    onError: (error) => {
      console.error("Error updating pool category:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating contact category"
          : "Fehler beim Aktualisieren der Kontaktkategorie"
      );
    },
  });

  const handleCategorySelect = (category: string) => {
    updatePoolCategoryMutation.mutate(category);
  };

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
      <Button
        variant={lead.pool_category === "partner" ? "default" : "outline"}
        size="sm"
        onClick={() => handleCategorySelect("partner")}
        className="flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        {settings?.language === "en" ? "Partner" : "Partner"}
      </Button>
      <Button
        variant={lead.pool_category === "kunde" ? "default" : "outline"}
        size="sm"
        onClick={() => handleCategorySelect("kunde")}
        className="flex items-center gap-2"
      >
        <UserCheck className="h-4 w-4" />
        {settings?.language === "en" ? "Customer" : "Kunde"}
      </Button>
      <Button
        variant={lead.pool_category === "not_for_now" ? "default" : "outline"}
        size="sm"
        onClick={() => handleCategorySelect("not_for_now")}
        className="flex items-center gap-2"
      >
        <Clock className="h-4 w-4" />
        {settings?.language === "en" ? "Not For Now" : "Später"}
      </Button>
      <Button
        variant={lead.pool_category === "kein_interesse" ? "default" : "outline"}
        size="sm"
        onClick={() => handleCategorySelect("kein_interesse")}
        className="flex items-center gap-2"
      >
        <Archive className="h-4 w-4" />
        {settings?.language === "en" ? "Not Interested" : "Kein Interesse"}
      </Button>
    </div>
  );
};