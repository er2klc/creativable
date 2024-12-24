import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Bot, Scan } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { LeadSummary } from "./LeadSummary";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { LeadMessages } from "./LeadMessages";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Platform } from "@/config/platforms";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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
      return data as (Tables<"leads"> & {
        platform: Platform;
        messages: Tables<"messages">[];
        tasks: Tables<"tasks">[];
      });
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

  const scanProfile = async () => {
    if (!lead) return;
    setIsScanning(true);
    try {
      const response = await supabase.functions.invoke('scan-social-profile', {
        body: {
          leadId: lead.id,
          platform: lead.platform,
          username: lead.social_media_username
        },
      });

      if (response.error) throw response.error;

      toast.success(
        settings?.language === "en"
          ? "Profile scanned successfully"
          : "Profil erfolgreich gescannt"
      );
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    } catch (error) {
      console.error('Error scanning profile:', error);
      toast.error(
        settings?.language === "en"
          ? "Error scanning profile"
          : "Fehler beim Scannen des Profils"
      );
    } finally {
      setIsScanning(false);
    }
  };

  const updatePhaseOrderMutation = useMutation({
    mutationFn: async (updatedPhases: Tables<"lead_phases">[]) => {
      const { error } = await supabase
        .from("lead_phases")
        .upsert(
          updatedPhases.map(phase => ({
            id: phase.id,
            name: phase.name,
            order_index: phase.order_index,
            user_id: phase.user_id
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
    },
  });

  return (
    <Dialog open={!!leadId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] bg-white border rounded-lg shadow-lg overflow-hidden">
        <DialogHeader className="p-0">
          {lead && (
            <LeadDetailHeader
              lead={lead}
              onUpdateLead={updateLeadMutation.mutate}
            />
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>
        ) : lead ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <CompactPhaseSelector
                  lead={lead}
                  phases={phases}
                  onUpdateLead={updateLeadMutation.mutate}
                  onUpdatePhases={(phases) => updatePhaseOrderMutation.mutate(phases)}
                />
                <Button
                  variant="outline"
                  onClick={scanProfile}
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <Scan className="h-4 w-4" />
                  {isScanning 
                    ? (settings?.language === "en" ? "Scanning..." : "Scannt...")
                    : (settings?.language === "en" ? "Scan Profile" : "Profil scannen")}
                </Button>
              </div>
              
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
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

