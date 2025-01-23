import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useState } from "react";
import { LeadWithRelations } from "./types/lead";
import { useLeadSubscription } from "./hooks/useLeadSubscription";
import { useLeadMutations } from "./hooks/useLeadMutations";
import { LeadDetailHeader } from "./components/LeadDetailHeader";
import { LeadDetailContent } from "./components/LeadDetailContent";
import { DeleteLeadDialog } from "./components/DeleteLeadDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

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
  const location = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: lead, isLoading } = useQuery({
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
    enabled: !!leadId && isValidUUID(leadId)
  });

  useLeadSubscription(leadId);

  const deleteLeadMutation = useMutation({
    mutationFn: async () => {
      if (!leadId || isDeleting) return;
      setIsDeleting(true);
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

      // Delete related records first
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

      // Finally delete the lead
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
      console.log("Lead deleted successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      
      toast.success(
        settings?.language === "en"
          ? "Contact deleted successfully"
          : "Kontakt erfolgreich gelöscht"
      );
      
      // Close the dialog and navigate
      onClose();
      
      // Check if we came from the contacts page
      const shouldNavigateToContacts = location.pathname.startsWith('/contacts');
      navigate(shouldNavigateToContacts ? '/contacts' : '/pool', { replace: true });
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting contact"
          : "Fehler beim Löschen des Kontakts"
      );
      setIsDeleting(false);
    },
    onSettled: () => {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  });

  const handleDelete = () => {
    if (!isDeleting) {
      deleteLeadMutation.mutate();
    }
  };

  return (
    <>
      <Dialog open={!!leadId} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl h-[90vh] bg-white border rounded-lg shadow-lg overflow-hidden">
          {lead && (
            <>
              <LeadDetailHeader 
                lead={lead}
                onUpdateLead={updateLeadMutation.mutate}
                onClose={onClose}
              />
              <LeadDetailContent
                lead={lead}
                onUpdateLead={updateLeadMutation.mutate}
                isLoading={isLoading}
                onDeleteClick={() => setShowDeleteDialog(true)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <DeleteLeadDialog 
        showDialog={showDeleteDialog} 
        setShowDialog={setShowDeleteDialog}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};