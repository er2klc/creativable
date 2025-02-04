import { DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useState } from "react";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadWithRelations } from "@/types/leads";
import { StatusButtons } from "./header/StatusButtons";
import { DeleteLeadDialog } from "./header/DeleteLeadDialog";
import { LeadName } from "./header/LeadName";
import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export interface LeadDetailHeaderProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onDeleteLead: () => void;
}

export function LeadDetailHeader({ lead, onUpdateLead, onDeleteLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
  try {
    // Wenn derselbe Status geklickt wird, setze ihn zurück auf 'lead'
    const status = lead.status === newStatus ? 'lead' : newStatus;

    // Hole Standard-Pipeline und Phase
    const { data: defaultPipeline } = await supabase
      .from('pipelines')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('order_index')
      .limit(1)
      .single();

    if (!defaultPipeline) throw new Error('No default pipeline found');

    const { data: defaultPhase } = await supabase
      .from('pipeline_phases')
      .select('id')
      .eq('pipeline_id', defaultPipeline.id)
      .order('order_index')
      .limit(1)
      .single();

    if (!defaultPhase) throw new Error('No default phase found');

    const updates: Partial<Tables<"leads">> = {
      status,
      ...(status === 'lead' ? {
        pipeline_id: defaultPipeline.id,
        phase_id: defaultPhase.id
      } : {}),
      ...(status === 'partner' ? {
        onboarding_progress: {
          message_sent: false,
          team_invited: false,
          training_provided: false,
          intro_meeting_scheduled: false
        }
      } : {})
    };

    await onUpdateLead(updates);

    // **🚀 NUR Statusänderungen in Timeline speichern**
    if (['partner', 'customer', 'not_for_now', 'no_interest'].includes(newStatus)) {
      const { error: timelineError } = await supabase
        .from('timeline')
        .insert({
          lead_id: lead.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          type: 'status_change', // ✅ Richtiger Typ für Statusänderung
          content: `Status geändert zu ${status}`,
          metadata: {
            oldStatus: lead.status,
            newStatus: status
          }
        });

      if (timelineError) throw timelineError;
    } 

    toast.success(
      settings?.language === "en"
        ? "Status erfolgreich aktualisiert"
        : "Status erfolgreich aktualisiert"
    );

  } catch (error) {
    console.error('Error updating status:', error);
    toast.error(
      settings?.language === "en"
        ? "Fehler beim Aktualisieren des Status"
        : "Fehler beim Aktualisieren des Status"
    );
  }
};


  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    onDeleteLead();
  };

  return (
    <>
      <DialogHeader className="p-6 bg-card border-b">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start border-b">
            <LeadName name={lead.name} platform={lead.platform as Platform} />
            <div className="flex gap-2">
              <StatusButtons 
                status={lead.status || 'lead'} 
                onStatusChange={handleStatusChange}
              />
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </div>
          </div>
          <CompactPhaseSelector
            lead={lead}
            onUpdateLead={onUpdateLead}
          />
        </div>
      </DialogHeader>

      <DeleteLeadDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
