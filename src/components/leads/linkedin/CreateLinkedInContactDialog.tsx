import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useLinkedInScan } from "./hooks/useLinkedInScan";
import { LinkedInScanAnimation } from "./components/LinkedInScanAnimation";
import { LinkedInScanForm } from "./components/LinkedInScanForm";

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
  const [contactType, setContactType] = useState("");
  const scanState = useLinkedInScan();
  const { settings } = useSettings();

  // Close dialog when scan reaches 100%
  useEffect(() => {
    if (scanState.scanProgress === 100) {
      setTimeout(() => {
        onOpenChange(false);
        toast.success("Kontakt erfolgreich erstellt");
      }, 500); // Small delay to show 100%
    }
  }, [scanState.scanProgress, onOpenChange]);

  // Fetch default pipeline if none provided
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
        .single();
      
      return pipeline;
    },
    enabled: !pipelineId
  });

  // Fetch first phase of pipeline
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
        .single();
      
      return phase;
    },
    enabled: !!(pipelineId || defaultPipeline?.id)
  });

  const handleSubmit = async () => {
    if (!username) {
      toast.error("Bitte gib einen LinkedIn Benutzernamen ein");
      return;
    }

    if (!contactType) {
      toast.error("Bitte wähle einen Kontakttyp aus");
      return;
    }

    try {
      scanState.setIsLoading(true);
      scanState.setScanProgress(0);
      scanState.setCurrentFile(undefined);
      scanState.setIsSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      if (!settings?.apify_api_key) {
        toast.error("Bitte füge einen Apify API Key in den Einstellungen hinzu");
        return;
      }

      const targetPipelineId = pipelineId || defaultPipeline?.id;
      const targetPhaseId = defaultPhase || firstPhase?.id;

      if (!targetPipelineId || !targetPhaseId) {
        toast.error("Keine Pipeline oder Phase gefunden");
        return;
      }

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          user_id: user.id,
          name: username,
          platform: "LinkedIn",
          social_media_username: username,
          pipeline_id: targetPipelineId,
          phase_id: targetPhaseId,
          contact_type: contactType,
          industry: "Not Specified"
        })
        .select()
        .single();

      if (leadError) throw leadError;

      scanState.pollProgress(lead.id);

      const { error } = await supabase.functions.invoke('scan-linkedin-profile', {
        body: {
          username: username,
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
      forceMount={true}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>LinkedIn Kontakt hinzufügen</DialogTitle>
        </DialogHeader>
        <div id="linkedin-scan-description" className="sr-only">
          Dialog für das Hinzufügen eines neuen LinkedIn Kontakts. Gib den Benutzernamen ein, um das Profil zu scannen.
        </div>
        {scanState.isLoading ? (
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
            contactType={contactType}
            setContactType={setContactType}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}