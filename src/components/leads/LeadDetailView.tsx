import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./detail/LeadInfoCard";
import { TaskList } from "./detail/TaskList";
import { NoteList } from "./detail/NoteList";
import { LeadSummary } from "./detail/LeadSummary";
import { LeadDetailHeader } from "./detail/LeadDetailHeader";
import { LeadMessages } from "./detail/LeadMessages";
import { useState } from "react";
import { toast } from "sonner";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const { data, error } = await supabase
        .from("leads")
        .select("*, messages(*), tasks(*)")
        .eq("id", leadId)
        .single();

      if (error) throw error;
      return data as Tables<"leads"> & {
        messages: Tables<"messages">[];
        tasks: Tables<"tasks">[];
      };
    },
    enabled: !!leadId,
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["lead-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_phases")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
    },
  });

  return (
    <Dialog open={!!leadId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {lead && (
            <LeadDetailHeader
              lead={lead}
              phases={phases}
              onUpdateLead={updateLeadMutation.mutate}
            />
          )}
        </DialogHeader>

        {isLoading ? (
          <div>{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>
        ) : lead ? (
          <div className="grid gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h3 className="text-lg font-semibold">
                  {settings?.language === "en" ? "AI Summary" : "KI-Zusammenfassung"}
                </h3>
              </div>
              <LeadSummary lead={lead} />
            </div>
            
            <LeadInfoCard lead={lead} />
            <TaskList leadId={lead.id} tasks={lead.tasks} />
            <NoteList leadId={lead.id} />
            <LeadMessages messages={lead.messages} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};