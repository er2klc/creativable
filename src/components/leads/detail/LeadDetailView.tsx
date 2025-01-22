import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { useLeadSubscription } from "./hooks/useLeadSubscription";
import { LeadWithRelations } from "./types/lead";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { DeleteLeadDialog } from "./components/DeleteLeadDialog";
import { LeadDetailHeader } from "./components/LeadDetailHeader";
import { LeadDetailContent } from "./components/LeadDetailContent";

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
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
  });

  useLeadSubscription(leadId);

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<LeadWithRelations>) => {
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

      console.log('Starting deletion process for lead:', leadId);

      const relatedTables = [
        'contact_group_states',
        'instagram_scan_history',
        'lead_files',
        'lead_subscriptions',
        'messages',
        'notes',
        'tasks'
      ] as const;

      for (const table of relatedTables) {
        console.log(`Deleting related records from ${table}`);
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('lead_id', leadId);
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          throw error;
        }
      }

      console.log('Deleting lead record');
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        console.error("Error deleting lead:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(
        settings?.language === "en"
          ? "Contact deleted successfully"
          : "Kontakt erfolgreich gelöscht"
      );
      onClose();
      // Always navigate to /contacts after successful deletion
      navigate('/contacts', { replace: true });
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
              <LeadDetailHeader
                lead={lead}
                onUpdateLead={updateLeadMutation.mutate}
                onClose={onClose}
              />
            )}
          </DialogHeader>

          {isLoading ? (
            <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>
          ) : lead ? (
            <LeadDetailContent
              lead={lead}
              onUpdateLead={updateLeadMutation.mutate}
              isLoading={isLoading}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteLeadDialog
        showDialog={showDeleteDialog}
        setShowDialog={setShowDeleteDialog}
        onDelete={() => deleteLeadMutation.mutate()}
      />
    </>
  );
};