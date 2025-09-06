
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useLinkedInScan } from "./hooks/useLinkedInScan";
import { LinkedInScanAnimation } from "./components/LinkedInScanAnimation";
import { LinkedInScanForm } from "./components/LinkedInScanForm";
import { ExistingContactAlert } from "../shared/ExistingContactAlert";
import { LeadWithRelations } from "@/types/leads";

interface CreateLinkedInContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string | null;
  defaultPhase?: string;
}

export function CreateLinkedInContactDialog({
  open,
  onOpenChange,
  pipelineId,
  defaultPhase
}: CreateLinkedInContactDialogProps) {
  const [username, setUsername] = useState("");
  const scanState = useLinkedInScan();
  const [existingContact, setExistingContact] = useState<LeadWithRelations | null>(null);

  const { data: defaultPipeline } = useQuery({
    queryKey: ["default-pipeline"],
    queryFn: async () => {
      if (pipelineId) return null;
      
      const { data: pipeline } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("order_index")
        .limit(1)
        .maybeSingle();
      
      return pipeline;
    },
    enabled: !pipelineId
  });

  const { data: firstPhase } = useQuery({
    queryKey: ["first-phase", pipelineId || defaultPipeline?.id],
    queryFn: async () => {
      const targetPipelineId = pipelineId || defaultPipeline?.id;
      if (!targetPipelineId) return null;

      const { data: phase } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", targetPipelineId)
        .order("order_index")
        .limit(1)
        .maybeSingle();
      
      return phase;
    },
    enabled: !!(pipelineId || defaultPipeline?.id)
  });

  const checkExistingContact = async (username: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Normalize username to lowercase for consistent comparison
      const normalizedUsername = username.toLowerCase();

      const { data: contact, error } = await supabase
        .from("leads")
        .select(`
          *,
          pipeline:pipeline_id (
            name
          ),
          phase:phase_id (
            name
          )
        `)
        .eq("user_id", user.id)
        .ilike("social_media_username", normalizedUsername)
        .eq("platform", "LinkedIn")
        .maybeSingle();

      if (error) {
        console.error("Error checking for existing contact:", error);
        return null;
      }

      return contact as LeadWithRelations | null;
    } catch (error) {
      console.error("Error in checkExistingContact:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!username) {
      toast.error("Bitte gib einen LinkedIn Benutzernamen ein");
      return;
    }

    try {
      // Normalize username
      const normalizedUsername = username.toLowerCase().trim();

      // Check for existing contact first
      const existing = await checkExistingContact(normalizedUsername);
      if (existing) {
        setExistingContact(existing);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const targetPipelineId = pipelineId || defaultPipeline?.id;
      const targetPhaseId = defaultPhase || firstPhase?.id;

      if (!targetPipelineId || !targetPhaseId) {
        toast.error("Keine Pipeline oder Phase gefunden");
        return;
      }

      // Use a transaction to ensure atomicity
      const { data: lead, error: leadError } = await supabase
        .rpc('create_unique_lead', {
          p_user_id: user.id,
          p_name: normalizedUsername,
          p_platform: "LinkedIn",
          p_username: normalizedUsername,
          p_pipeline_id: targetPipelineId,
          p_phase_id: targetPhaseId
        });

      if (leadError) {
        if (leadError.code === '23505') { // Unique violation
          const existing = await checkExistingContact(normalizedUsername);
          if (existing) {
            setExistingContact(existing);
            return;
          }
        }
        throw leadError;
      }

      scanState.setIsLoading(true);

      scanState.pollProgress(lead.id);

      const { error } = await supabase.functions.invoke('scan-linkedin-profile', {
        body: {
          username: normalizedUsername,
          leadId: lead.id
        }
      });

      if (error) throw error;

    } catch (error) {
      console.error("Error adding LinkedIn contact:", error);
      toast.error("Fehler beim Hinzufügen des LinkedIn Kontakts");
      scanState.setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>LinkedIn Kontakt hinzufügen</DialogTitle>
        </DialogHeader>
        {existingContact ? (
          <ExistingContactAlert
            contact={existingContact}
            onClose={() => {
              setExistingContact(null);
              onOpenChange(false);
            }}
          />
        ) : scanState.isLoading ? (
          <LinkedInScanAnimation 
            scanProgress={scanState.scanProgress} 
            currentFile={scanState.currentFile}
          />
        ) : (
          <LinkedInScanForm
            username={username}
            setUsername={setUsername}
            isLoading={scanState.isLoading}
            isSuccess={scanState.isSuccess}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            contactType=""
            setContactType={() => {}}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
