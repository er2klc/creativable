import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bot, CheckCircle, ArrowRight, Trash2 } from "lucide-react";
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
import { CompactPhaseSelector } from "./detail/CompactPhaseSelector";
import { LeadTimeline } from "./detail/LeadTimeline";
import { ContactFieldManager } from "@/components/leads/detail/contact-info/ContactFieldManager";
import { toast } from "sonner";
import { type Platform } from "@/config/platforms";
import { useLeadSubscription } from "@/components/leads/detail/hooks/useLeadSubscription";
import { LeadWithRelations } from "./detail/types/lead";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId || !isValidUUID(leadId)) {
        throw new Error("Invalid lead ID");
      }

      const { data, error } = await supabase
        .from("leads")
        .select("*, messages(*), tasks(*), notes(*), lead_files(*)")
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      return data as LeadWithRelations;
    },
    enabled: !!leadId && isValidUUID(leadId),
  });

  useLeadSubscription(leadId);

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      if (!leadId || !isValidUUID(leadId)) {
        throw new Error("Invalid lead ID");
      }

      const hasChanges = Object.entries(updates).some(
        ([key, value]) => lead?.[key as keyof typeof lead] !== value
      );

      if (!hasChanges) {
        return lead;
      }

      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const hasChanges = Object.entries(variables).some(
        ([key, value]) => lead?.[key as keyof typeof lead] !== value
      );
      
      if (hasChanges) {
        queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        toast.success(
          settings?.language === "en"
            ? "Contact updated successfully"
            : "Kontakt erfolgreich aktualisiert"
        );
      }
    },
    onError: (error) => {
      console.error("Error updating lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating contact"
          : "Fehler beim Aktualisieren des Kontakts"
      );
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async () => {
      if (!leadId) return;

      // Delete related records first
      const tables = ['messages', 'tasks', 'notes', 'lead_files'];
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('lead_id', leadId);
        
        if (error) throw error;
      }

      // Finally delete the lead
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(
        settings?.language === "en"
          ? "Contact deleted successfully"
          : "Kontakt erfolgreich gelöscht"
      );
      onClose();
      navigate('/leads');
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting contact"
          : "Fehler beim Löschen des Kontakts"
      );
    }
  });

  const deletePhaseChangeMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Phase change deleted successfully"
          : "Phasenänderung erfolgreich gelöscht"
      );
    },
  });

  if (error) {
    toast.error(
      settings?.language === "en"
        ? "Error loading contact"
        : "Fehler beim Laden des Kontakts"
    );
    onClose();
    return null;
  }

  return (
    <>
      <Dialog open={!!leadId} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl h-[90vh] bg-white border rounded-lg shadow-lg overflow-hidden">
          <DialogHeader className="p-0">
            {lead && (
              lead.status === 'partner' && lead.onboarding_progress && 
              Object.values(lead.onboarding_progress).every(value => value) ? (
                <div className="p-4 bg-green-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-700">Onboarding abgeschlossen</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => onClose()}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Zurück zur Kontakt Page
                  </Button>
                </div>
              ) : (
                <LeadDetailHeader
                  lead={lead}
                  onUpdateLead={updateLeadMutation.mutate}
                />
              )
            )}
          </DialogHeader>

          {isLoading ? (
            <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>
          ) : lead ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <CompactPhaseSelector
                  lead={lead}
                  onUpdateLead={updateLeadMutation.mutate}
                />
                
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
                <ContactFieldManager />
                <LeadTimeline 
                  lead={lead} 
                  onDeletePhaseChange={deletePhaseChangeMutation.mutate}
                />
                <TaskList leadId={lead.id} />
                <NoteList leadId={lead.id} />
                <LeadMessages leadId={lead.id} messages={lead.messages} />

                {/* Delete Button */}
                <div className="absolute bottom-4 left-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {settings?.language === "en" 
                ? "Delete Contact" 
                : "Kontakt löschen"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {settings?.language === "en"
                ? "This action cannot be undone. This will permanently delete the contact and all associated data."
                : "Diese Aktion kann nicht rückgängig gemacht werden. Der Kontakt und alle zugehörigen Daten werden dauerhaft gelöscht."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {settings?.language === "en" ? "Cancel" : "Abbrechen"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteLeadMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {settings?.language === "en" ? "Delete" : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};